import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements/[requirementId]/testcases
export async function GET(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const { requirementId } = await params;
    const requirement = await prisma.internalRequirement.findUnique({
      where: { id: requirementId },
      include: {
        testCases: {
          include: {
            steps: true,
            suite: {
              select: { id: true, name: true }
            },
            testRuns: {
              orderBy: { executedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    return NextResponse.json(requirement.testCases);
  } catch (error) {
    console.error("Failed to fetch test cases:", error);
    return NextResponse.json({ error: "Failed to fetch test cases" }, { status: 500 });
  }
}

// POST /api/requirements/[requirementId]/testcases - Link test cases
export async function POST(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  try {
    const { requirementId } = await params;

    // Validate requirementId
    if (!requirementId || requirementId.trim().length === 0) {
      return NextResponse.json(
        { error: "Requirement ID is required" },
        { status: 400 }
      );
    }

    // Handle empty request body
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { testCaseIds } = body;

    if (!testCaseIds || !Array.isArray(testCaseIds)) {
      return NextResponse.json(
        { error: "testCaseIds array is required" },
        { status: 400 }
      );
    }

    // Filter out empty strings and invalid IDs
    const validTestCaseIds = testCaseIds.filter((id: string) => id && typeof id === 'string' && id.trim().length > 0);

    // If no valid IDs, just return current state without connecting
    if (validTestCaseIds.length === 0) {
      const requirement = await prisma.internalRequirement.findUnique({
        where: { id: requirementId },
        include: {
          testCases: {
            select: { id: true, title: true, status: true }
          }
        }
      });
      return NextResponse.json(requirement);
    }

    // Verify requirement exists first
    const existingRequirement = await prisma.internalRequirement.findUnique({
      where: { id: requirementId },
      select: { id: true }
    });

    if (!existingRequirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // Connect test cases to requirement one by one to handle errors gracefully
    const updated = await prisma.internalRequirement.update({
      where: { id: requirementId },
      data: {
        testCases: {
          connect: validTestCaseIds.map((id: string) => ({ id }))
        }
      },
      include: {
        testCases: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to link test cases:", error);
    return NextResponse.json({ error: "Failed to link test cases" }, { status: 500 });
  }
}

// DELETE /api/requirements/[requirementId]/testcases?testCaseId=xxx
export async function DELETE(request: Request, { params }: { params: Promise<{ requirementId: string }> }) {
  const { requirementId } = await params;
  const { searchParams } = new URL(request.url);
  const testCaseId = searchParams.get('testCaseId');

  if (!testCaseId) {
    return NextResponse.json({ error: "testCaseId is required" }, { status: 400 });
  }

  try {
    // Disconnect test case from requirement
    const updated = await prisma.internalRequirement.update({
      where: { id: requirementId },
      data: {
        testCases: {
          disconnect: { id: testCaseId }
        }
      },
      include: {
        testCases: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to unlink test case:", error);
    return NextResponse.json({ error: "Failed to unlink test case" }, { status: 500 });
  }
}
