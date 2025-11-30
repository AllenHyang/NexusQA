import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/projects/[projectId]/members/[memberId]
// Update member role (AC4)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const { projectId, memberId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Find the member
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.projectId !== projectId) {
      return NextResponse.json({ error: 'Member does not belong to this project' }, { status: 400 });
    }

    // Owner cannot be demoted (AC4)
    if (member.role === 'OWNER' && role !== 'OWNER') {
      return NextResponse.json({ error: 'Cannot demote project owner' }, { status: 403 });
    }

    // If promoting someone to OWNER, demote current owner to ADMIN
    if (role === 'OWNER' && member.role !== 'OWNER') {
      const currentOwner = await prisma.projectMember.findFirst({
        where: { projectId, role: 'OWNER' }
      });

      if (currentOwner) {
        // Transfer ownership: demote old owner, promote new owner
        await prisma.$transaction([
          prisma.projectMember.update({
            where: { id: currentOwner.id },
            data: { role: 'ADMIN' }
          }),
          prisma.projectMember.update({
            where: { id: memberId },
            data: { role: 'OWNER' }
          })
        ]);

        const updated = await prisma.projectMember.findUnique({
          where: { id: memberId },
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

        return NextResponse.json(updated);
      }
    }

    // Normal role update
    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update member role:', error);
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/members/[memberId]
// Remove a member from project (AC3)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const { projectId, memberId } = await params;

    // Find the member
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.projectId !== projectId) {
      return NextResponse.json({ error: 'Member does not belong to this project' }, { status: 400 });
    }

    // Owner cannot be removed (AC3)
    if (member.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove project owner' }, { status: 403 });
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}

// GET /api/projects/[projectId]/members/[memberId]
// Get a single member
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const { projectId, memberId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
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

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.projectId !== projectId) {
      return NextResponse.json({ error: 'Member does not belong to this project' }, { status: 400 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Failed to fetch member:', error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}
