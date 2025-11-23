import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  try {
      const where = projectId ? { projectId } : {};
      const testCases = await prisma.testCase.findMany({
          where,
          include: {
            steps: { orderBy: { order: 'asc' } },
            history: { orderBy: { date: 'desc' } }
          },
          orderBy: { createdAt: 'desc' }
      });
      
      // Parse JSON tags
      const parsedCases = testCases.map(tc => ({
          ...tc,
          tags: tc.tags ? JSON.parse(tc.tags as string) : [],
          history: tc.history.map(h => ({
              ...h,
              environment: h.env
          }))
      }));
      
      return NextResponse.json(parsedCases);
  } catch (e) {
      console.error("GET Error:", e);
      return NextResponse.json({ error: "Failed to fetch test cases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
      const body = await request.json();
      
      // Basic payload for TestCase fields
      const basicPayload = {
          title: body.title,
          description: body.description,
          preconditions: body.preconditions,
          userStory: body.userStory,
          requirementId: body.requirementId,
          status: body.status || "UNTESTED",
          priority: body.priority || "P2",
          projectId: body.projectId,
          suiteId: body.suiteId,
          visualReference: body.visualReference,
          tags: JSON.stringify(body.tags || []),
          authorId: body.authorId,
          assignedToId: body.assignedToId
      };

      if (body.id) {
          // Update using transaction to replace steps/history
          const result = await prisma.$transaction(async (tx) => {
              // 1. Update basic info
              await tx.testCase.update({
                  where: { id: body.id },
                  data: basicPayload
              });

              // 2. Handle Steps: Delete all and create new
              if (body.steps) {
                  await tx.testStep.deleteMany({ where: { testCaseId: body.id } });
                  if (body.steps.length > 0) {
                      await Promise.all(body.steps.map((s: any, i: number) => 
                          tx.testStep.create({
                              data: {
                                  testCaseId: body.id,
                                  action: s.action,
                                  expected: s.expected,
                                  order: i
                              }
                          })
                      ));
                  }
              }

              // 3. Handle History: Delete all and create new
              if (body.history) {
                   await tx.executionRecord.deleteMany({ where: { testCaseId: body.id } });
                   if (body.history.length > 0) {
                       await Promise.all(body.history.map((h: any) => 
                           tx.executionRecord.create({
                               data: {
                                   testCaseId: body.id,
                                   date: h.date ? new Date(h.date) : new Date(),
                                   status: h.status,
                                   executedBy: h.executedBy,
                                   notes: h.notes,
                                   bugId: h.bugId,
                                   env: h.environment, 
                                   evidence: h.evidence
                               }
                           })
                       ));
                   }
              }

              return await tx.testCase.findUnique({
                  where: { id: body.id },
                  include: { steps: { orderBy: { order: 'asc' } }, history: { orderBy: { date: 'desc' } } }
              });
          });
          
          if (!result) throw new Error("Update failed");

          return NextResponse.json({
              ...result,
              tags: result.tags ? JSON.parse(result.tags as string) : [],
              history: result.history.map(h => ({ ...h, environment: h.env }))
          });
      } else {
          // Create
          const created = await prisma.testCase.create({
              data: {
                  ...basicPayload,
                  steps: {
                      create: body.steps?.map((s: any, i: number) => ({
                          action: s.action,
                          expected: s.expected,
                          order: i
                      })) || []
                  },
                  history: {
                      create: body.history?.map((h: any) => ({
                          date: h.date ? new Date(h.date) : new Date(),
                          status: h.status,
                          executedBy: h.executedBy,
                          notes: h.notes,
                          bugId: h.bugId,
                          env: h.environment,
                          evidence: h.evidence
                      })) || []
                  }
              },
              include: { steps: true, history: true }
          });
          return NextResponse.json({
              ...created,
              tags: created.tags ? JSON.parse(created.tags as string) : [],
              history: created.history.map(h => ({ ...h, environment: h.env }))
          }, { status: 201 });
      }
  } catch (e) {
      console.error("POST Error:", e);
      return NextResponse.json({ error: "Failed to save test case" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    // Bulk Update Handler (Status, Suite, etc.)
    try {
        const body = await request.json();
        const { ids, updates } = body;
        
        // Prisma updateMany (works fine for top-level fields)
        await prisma.testCase.updateMany({
            where: { id: { in: ids } },
            data: updates
        });
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to bulk update" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids'); // Comma separated

    try {
        if (id) {
            await prisma.testCase.delete({ where: { id } });
        } else if (ids) {
            const idList = ids.split(',');
            await prisma.testCase.deleteMany({ where: { id: { in: idList } } });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete test case" }, { status: 500 });
    }
}