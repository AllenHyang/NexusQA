import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const { caseIds } = body; // Array of strings

    if (!Array.isArray(caseIds)) {
        return NextResponse.json({ error: "caseIds must be an array" }, { status: 400 });
    }

    // Check for existing runs to avoid duplicates
    const existingRuns = await prisma.testRun.findMany({
        where: {
            testPlanId: planId,
            testCaseId: { in: caseIds }
        },
        select: { testCaseId: true }
    });

    const existingIds = new Set(existingRuns.map(r => r.testCaseId));
    const newIds = caseIds.filter(id => !existingIds.has(id));
    
    if (newIds.length > 0) {
        // Fetch case details for snapshot
        const casesToSnapshot = await prisma.testCase.findMany({
            where: { id: { in: newIds } },
            include: { steps: true }
        });

        await prisma.$transaction(
            casesToSnapshot.map(tc => prisma.testRun.create({
                data: {
                    testPlanId: planId,
                    testCaseId: tc.id,
                    status: "UNTESTED",
                    snapshot: JSON.stringify({
                        title: tc.title,
                        description: tc.description,
                        preconditions: tc.preconditions,
                        steps: tc.steps.map(s => ({ action: s.action, expected: s.expected, order: s.order }))
                    })
                }
            }))
        );
    }

    return NextResponse.json({ added: newIds.length, skipped: existingIds.size });
  } catch (e) {
     console.error("Error adding cases to plan:", e);
     return NextResponse.json({ error: "Failed to add cases" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
        return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    await prisma.testRun.deleteMany({
        where: {
            testPlanId: planId,
            testCaseId: caseId
        }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
     console.error("Error removing case from plan:", e);
     return NextResponse.json({ error: "Failed to remove case" }, { status: 500 });
  }
}
