import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to sanitize TestCase for snapshot (similar to how it's done in plan/case add)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateTestCaseSnapshot = (testCase: any) => {
    if (!testCase) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { history, steps, ...rest } = testCase; 
    return JSON.stringify({
        ...rest,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        steps: steps?.map((s: any) => ({ action: s.action, expected: s.expected })) || [],
    });
};

export async function POST(request: Request, { params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const originalPlanId = planId;

  try {
    const originalPlan = await prisma.testPlan.findUnique({
      where: { id: originalPlanId },
      include: {
        runs: {
          select: { testCaseId: true, snapshot: true } 
        },
      },
    });

    if (!originalPlan) {
      return NextResponse.json({ error: "Original Test Plan not found." }, { status: 404 });
    }

    const newPlan = await prisma.testPlan.create({
      data: {
        name: `${originalPlan.name} (Copy)`,
        description: originalPlan.description,
        projectId: originalPlan.projectId,
        startDate: originalPlan.startDate,
        endDate: originalPlan.endDate,
        status: "PLANNED", 
      },
    });

    const newTestRunsData = [];
    for (const originalRun of originalPlan.runs) {
      const latestTestCase = await prisma.testCase.findUnique({
        where: { id: originalRun.testCaseId },
        include: { steps: { orderBy: { order: 'asc' } } }, 
      });

      if (latestTestCase) {
        newTestRunsData.push({
          testPlanId: newPlan.id,
          testCaseId: latestTestCase.id,
          status: "UNTESTED", 
          snapshot: generateTestCaseSnapshot(latestTestCase), 
        });
      }
    }

    if (newTestRunsData.length > 0) {
      // SQLite doesn't support createMany, use Promise.all instead
      await Promise.all(newTestRunsData.map(data => prisma.testRun.create({ data })));
    }

    const createdPlanWithRuns = await prisma.testPlan.findUnique({
        where: { id: newPlan.id },
        include: {
            runs: {
                include: { testCase: true } 
            }
        }
    });

    return NextResponse.json(createdPlanWithRuns, { status: 201 });

  } catch (error) {
    console.error("Error duplicating Test Plan:", error);
    return NextResponse.json({ error: "Failed to duplicate Test Plan." }, { status: 500 });
  }
}