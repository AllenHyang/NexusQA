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
        await prisma.testRun.createMany({
            data: newIds.map(id => ({
                testPlanId: planId,
                testCaseId: id,
                status: "UNTESTED"
            }))
        });
    }

    return NextResponse.json({ added: newIds.length, skipped: existingIds.size });
  } catch (e) {
     console.error("Error adding cases to plan:", e);
     return NextResponse.json({ error: "Failed to add cases" }, { status: 500 });
  }
}
