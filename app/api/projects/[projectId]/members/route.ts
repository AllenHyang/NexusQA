import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[projectId]/members
// Get all members of a project with user details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { projectId };

    // Support search by user name or email (AC5)
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      };
    }

    const members = await prisma.projectMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // OWNER first
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Failed to fetch project members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/projects/[projectId]/members
// Add a new member to the project (AC2)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { userId, role = 'MEMBER', invitedBy } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'User is already a member of this project' }, { status: 409 });
    }

    // Create member
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
        invitedBy
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Failed to add project member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
