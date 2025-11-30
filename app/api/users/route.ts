import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_ROLES = ['ADMIN', 'QA_LEAD', 'TESTER', 'PM', 'DEVELOPER'];

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

// POST /api/users
// Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, avatar } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'TESTER',
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PUT /api/users
// Update an existing user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role, avatar } = body;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate fields if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if new email already exists (for a different user)
    if (email && email.trim().toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (emailExists) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users
// Delete a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for dependencies (authored test cases, defects, etc.)
    const dependencies = await prisma.$transaction([
      prisma.testCase.count({ where: { authorId: id } }),
      prisma.testCase.count({ where: { assignedToId: id } }),
      prisma.defect.count({ where: { authorId: id } }),
      prisma.defect.count({ where: { assigneeId: id } }),
      prisma.projectMember.count({ where: { userId: id } }),
    ]);

    const totalDependencies = dependencies.reduce((sum, count) => sum + count, 0);

    if (totalDependencies > 0) {
      return NextResponse.json({
        error: "Cannot delete user with existing associations",
        details: {
          authoredTestCases: dependencies[0],
          assignedTestCases: dependencies[1],
          authoredDefects: dependencies[2],
          assignedDefects: dependencies[3],
          projectMemberships: dependencies[4],
        }
      }, { status: 409 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
