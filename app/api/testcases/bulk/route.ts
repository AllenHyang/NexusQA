import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ImportedTestCase } from '@/lib/importParser';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, cases } = body;

    if (!projectId || !cases || !Array.isArray(cases)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Process cases in a transaction
    const results = await prisma.$transaction(
      cases.map((testCase: ImportedTestCase) => 
        prisma.testCase.create({
          data: {
            title: testCase.title,
            description: testCase.description,
            preconditions: testCase.preconditions,
            userStory: testCase.userStory,
            requirementId: testCase.requirementId,
            priority: testCase.priority || "P2",
            status: "UNTESTED",
            projectId: projectId,
            tags: JSON.stringify(testCase.tags || []),
            steps: {
              create: testCase.steps?.map((step, index) => ({
                action: step.action,
                expected: step.expected,
                order: index
              })) || []
            }
          },
          include: {
            steps: true
          }
        })
      )
    );

    // Format response similar to other endpoints (parse tags, format history/steps if needed)
    const formattedResults = results.map(res => ({
      ...res,
      tags: res.tags ? JSON.parse(res.tags as string) : [],
      history: []
    }));

    return NextResponse.json({ 
      success: true, 
      count: results.length, 
      data: formattedResults 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Bulk Import Error:", String(error));
    return NextResponse.json({ error: "Failed to import test cases" }, { status: 500 });
  }
}
