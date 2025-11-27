import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements?projectId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    const requirements = await prisma.internalRequirement.findMany({
      where: { projectId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        testCases: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate coverage and pass rates for each requirement
    const requirementsWithStats = requirements.map(req => {
      const testCases = req.testCases;
      const totalCases = testCases.length;
      const passedCases = testCases.filter(tc => tc.status === 'PASSED').length;
      const failedCases = testCases.filter(tc => tc.status === 'FAILED').length;
      const executedCases = passedCases + failedCases;

      return {
        ...req,
        stats: {
          totalCases,
          passedCases,
          failedCases,
          coverageRate: totalCases > 0 ? 1 : 0, // Has test cases = covered
          passRate: executedCases > 0 ? passedCases / executedCases : 0
        }
      };
    });

    return NextResponse.json(requirementsWithStats);
  } catch (error) {
    console.error("Failed to fetch requirements:", error);
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}

// POST /api/requirements - Create or Update
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.id) {
      // Update existing requirement
      const updated = await prisma.internalRequirement.update({
        where: { id: body.id },
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
          // New fields
          userStories: body.userStories,
          targetUsers: body.targetUsers,
          preconditions: body.preconditions,
          businessRules: body.businessRules,
          designReferences: body.designReferences,
          targetVersion: body.targetVersion,
          estimatedEffort: body.estimatedEffort,
          ownerId: body.ownerId,
          relatedRequirements: body.relatedRequirements,
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
    } else {
      // Create new requirement
      if (!body.projectId || !body.authorId || !body.title) {
        return NextResponse.json(
          { error: "projectId, authorId, and title are required" },
          { status: 400 }
        );
      }

      const created = await prisma.internalRequirement.create({
        data: {
          title: body.title,
          description: body.description || null,
          status: body.status || "DRAFT",
          acceptanceStatus: body.acceptanceStatus || "PENDING",
          priority: body.priority || "P2",
          tags: body.tags || "[]",
          acceptanceCriteria: body.acceptanceCriteria || "[]",
          projectId: body.projectId,
          authorId: body.authorId,
          // New fields with defaults
          userStories: body.userStories || "[]",
          targetUsers: body.targetUsers || "[]",
          preconditions: body.preconditions || null,
          businessRules: body.businessRules || "[]",
          designReferences: body.designReferences || "[]",
          targetVersion: body.targetVersion || null,
          estimatedEffort: body.estimatedEffort || null,
          ownerId: body.ownerId || null,
          relatedRequirements: body.relatedRequirements || "[]",
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
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Failed to save requirement:", error);
    return NextResponse.json({ error: "Failed to save requirement" }, { status: 500 });
  }
}

// DELETE /api/requirements?ids=id1,id2
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: "IDs are required" }, { status: 400 });
  }

  try {
    const idArray = ids.split(',');
    await prisma.internalRequirement.deleteMany({
      where: { id: { in: idArray } }
    });
    return NextResponse.json({ success: true, deleted: idArray.length });
  } catch (error) {
    console.error("Failed to delete requirements:", error);
    return NextResponse.json({ error: "Failed to delete requirements" }, { status: 500 });
  }
}
