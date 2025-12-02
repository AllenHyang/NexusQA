import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TestStep {
  action: string;
  expected: string;
  order: number;
}

interface TestCaseWithSteps {
  id: string;
  title: string;
  description: string | null;
  preconditions: string | null;
  steps: TestStep[];
}

/**
 * POST /api/plans/{planId}/requirements
 * 向 Test Plan 添加需求，并自动导入该需求关联的所有测试用例
 */
export async function POST(request: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const { requirementIds } = body; // Array of InternalRequirement IDs

    if (!Array.isArray(requirementIds) || requirementIds.length === 0) {
      return NextResponse.json({ error: "requirementIds must be a non-empty array" }, { status: 400 });
    }

    // Get all test cases linked to the specified requirements
    const requirements = await prisma.internalRequirement.findMany({
      where: {
        id: { in: requirementIds }
      },
      include: {
        testCases: {
          include: { steps: true }
        }
      }
    });

    // Collect all unique test case IDs from requirements
    const allCaseIds = new Set<string>();
    const caseDetailsMap = new Map<string, { testCase: TestCaseWithSteps; requirementTitle: string }>();

    for (const req of requirements) {
      for (const tc of req.testCases) {
        if (!allCaseIds.has(tc.id)) {
          allCaseIds.add(tc.id);
          caseDetailsMap.set(tc.id, { testCase: tc, requirementTitle: req.title });
        }
      }
    }

    if (allCaseIds.size === 0) {
      return NextResponse.json({
        added: 0,
        skipped: 0,
        message: "No test cases found linked to the selected requirements"
      });
    }

    // Check for existing runs to avoid duplicates
    const existingRuns = await prisma.testRun.findMany({
      where: {
        testPlanId: planId,
        testCaseId: { in: Array.from(allCaseIds) }
      },
      select: { testCaseId: true }
    });

    const existingIds = new Set(existingRuns.map(r => r.testCaseId));
    const newIds = Array.from(allCaseIds).filter(id => !existingIds.has(id));

    if (newIds.length > 0) {
      // Create TestRuns with snapshots for new test cases
      await prisma.$transaction(
        newIds.map(caseId => {
          const { testCase: tc } = caseDetailsMap.get(caseId)!;
          return prisma.testRun.create({
            data: {
              testPlanId: planId,
              testCaseId: tc.id,
              status: "UNTESTED",
              snapshot: JSON.stringify({
                title: tc.title,
                description: tc.description,
                preconditions: tc.preconditions,
                steps: tc.steps.map((s: TestStep) => ({ action: s.action, expected: s.expected, order: s.order }))
              })
            }
          });
        })
      );
    }

    return NextResponse.json({
      added: newIds.length,
      skipped: existingIds.size,
      totalFromRequirements: allCaseIds.size,
      requirementsProcessed: requirements.length
    });
  } catch (e) {
    console.error("Error adding requirements to plan:", e);
    return NextResponse.json({ error: "Failed to add requirements" }, { status: 500 });
  }
}
