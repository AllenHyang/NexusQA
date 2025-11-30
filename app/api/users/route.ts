import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users
// Get all users (supports search and project member filtering)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const projectId = searchParams.get('projectId');
    const excludeMembers = searchParams.get('excludeMembers') === 'true';

    const where: Record<string, unknown> = {};

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    // If projectId provided and excludeMembers is true,
    // exclude users who are already members of the project
    if (projectId && excludeMembers) {
      const existingMembers = await prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true }
      });
      const memberIds = existingMembers.map(m => m.userId);

      if (memberIds.length > 0) {
        where.id = { notIn: memberIds };
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
