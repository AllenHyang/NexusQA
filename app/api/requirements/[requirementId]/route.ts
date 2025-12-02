import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements/[requirementId]
export async function GET(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const { requirementId } = await params;
    const requirement = await prisma.internalRequirement.findUnique({
      where: { id: requirementId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        testCases: {
          include: {
            steps: true,
            testRuns: {
              orderBy: { executedAt: 'desc' },
              take: 1
            }
          }
        },
        project: {
          select: { id: true, name: true }
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, avatar: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    // Calculate stats
    const testCases = requirement.testCases;
    const totalCases = testCases.length;

    // Get latest test run status for each test case
    const caseStatuses = testCases.map(tc => {
      const latestRun = tc.testRuns[0];
      return latestRun?.status || tc.status;
    });

    const passedCases = caseStatuses.filter(s => s === 'PASSED').length;
    const failedCases = caseStatuses.filter(s => s === 'FAILED').length;
    const executedCases = passedCases + failedCases;

    return NextResponse.json({
      ...requirement,
      stats: {
        totalCases,
        passedCases,
        failedCases,
        untestedCases: totalCases - executedCases,
        coverageRate: totalCases > 0 ? 1 : 0,
        passRate: executedCases > 0 ? passedCases / executedCases : 0
      }
    });
  } catch (error) {
    console.error("Failed to fetch requirement:", error);
    return NextResponse.json({ error: "Failed to fetch requirement" }, { status: 500 });
  }
}

// PUT /api/requirements/[requirementId]
export async function PUT(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const { requirementId } = await params;
    const body = await request.json();

    const updated = await prisma.internalRequirement.update({
      where: { id: requirementId },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        acceptanceStatus: body.acceptanceStatus,
        priority: body.priority,
        tags: body.tags,
        acceptanceCriteria: body.acceptanceCriteria,
        acceptedBy: body.acceptedBy,
        acceptedAt: body.acceptedAt,
        acceptanceNotes: body.acceptanceNotes,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        testCases: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update requirement:", error);
    return NextResponse.json({ error: "Failed to update requirement" }, { status: 500 });
  }
}

// DELETE /api/requirements/[requirementId]
export async function DELETE(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const { requirementId } = await params;
    await prisma.internalRequirement.delete({
      where: { id: requirementId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete requirement:", error);
    return NextResponse.json({ error: "Failed to delete requirement" }, { status: 500 });
  }
}

// PATCH /api/requirements/[requirementId] - Update status or accept/reject
export async function PATCH(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const { requirementId } = await params;
    const body = await request.json();

    // Handle acceptance action
    if (body.action === 'ACCEPT' || body.action === 'REJECT') {
      const acceptanceStatus = body.action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';

      const updated = await prisma.internalRequirement.update({
        where: { id: requirementId },
        data: {
          acceptanceStatus,
          acceptedBy: body.userId,
          acceptedAt: new Date(),
          acceptanceNotes: body.notes || null,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      return NextResponse.json(updated);
    }

    // Handle status update
    if (body.status) {
      const updated = await prisma.internalRequirement.update({
        where: { id: requirementId },
        data: { status: body.status },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      return NextResponse.json(updated);
    }

    // Handle owner update (for kanban drag-drop)
    if ('ownerId' in body) {
      const updated = await prisma.internalRequirement.update({
        where: { id: requirementId },
        data: { ownerId: body.ownerId },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      return NextResponse.json(updated);
    }

    // Handle move to folder action
    if (body.action === 'MOVE_TO_FOLDER') {
      const { folderId, order } = body;

      const updated = await prisma.internalRequirement.update({
        where: { id: requirementId },
        data: {
          folderId: folderId || null,
          order: order ?? 0
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          folder: {
            select: { id: true, name: true, type: true }
          }
        }
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid PATCH request" }, { status: 400 });
  } catch (error) {
    console.error("Failed to patch requirement:", error);
    return NextResponse.json({ error: "Failed to patch requirement" }, { status: 500 });
  }
}
