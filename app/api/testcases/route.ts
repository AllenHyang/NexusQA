import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@/types'; // Import TestStatus

// Define interfaces for payload types
interface StepPayload {
    action: string;
    expected: string;
}

interface DefectPayload {
    externalId: string;
    tracker: string;
    severity: string;
    status: string;
    url: string;
    summary?: string;
}

interface HistoryPayload {
    date?: string;
    status: TestStatus;
    executedBy: string;
    notes?: string;
    bugId?: string;
    environment?: string;
    env?: string;
    evidence?: string;
    defects?: DefectPayload[];
}

const normalizePriority = (p: string) => {
    switch(p) {
        case 'P0': return 'CRITICAL';
        case 'P1': return 'HIGH';
        case 'P2': return 'MEDIUM';
        case 'P3': return 'LOW';
        default: return p;
    }
};

const safeParseTags = (tags: string | null) => {
    if (!tags) return [];
    try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  try {
      const where = projectId ? { projectId } : {};
      const testCases = await prisma.testCase.findMany({
          where,
          include: {
            steps: { orderBy: { order: 'asc' } },
            // requirements: true, // <<< Temporarily commented out to debug defect-management.spec.ts failure
            history: { 
                orderBy: { date: 'desc' },
                include: { defects: true }
            },
          },
          orderBy: { createdAt: 'desc' }
      });
      
      const parsedCases = testCases.map(tc => ({
          ...tc,
          tags: safeParseTags(tc.tags),
          priority: normalizePriority(tc.priority),
          history: tc.history.map(h => ({
              ...h,
              environment: h.env,
              defects: h.defects
          }))
          // requirements: tc.requirements // <<< This was the problematic line for deletion
      }));
      
      return NextResponse.json(parsedCases);
  } catch (error: unknown) {
      console.error("GET Error:", String(error));
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
          acceptanceCriteria: body.acceptanceCriteria,
          status: body.status || "UNTESTED",
          priority: body.priority || "P2",
          reviewStatus: body.reviewStatus || "PENDING",
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
                      await Promise.all(body.steps.map((s: StepPayload, i: number) => 
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
                       await Promise.all(body.history.map((h: HistoryPayload) => 
                           tx.executionRecord.create({
                               data: {
                                   testCaseId: body.id,
                                   date: h.date ? new Date(h.date) : new Date(),
                                   status: h.status,
                                   executedBy: h.executedBy,
                                   notes: h.notes,
                                   bugId: h.bugId,
                                   env: h.environment || h.env, 
                                   evidence: h.evidence,
                                   defects: {
                                       create: h.defects?.map((d: DefectPayload) => ({
                                           externalId: d.externalId,
                                           tracker: d.tracker,
                                           severity: d.severity,
                                           status: d.status,
                                           url: d.url,
                                           summary: d.summary
                                       })) || []
                                   }
                               }
                           })
                       ));
                   }
              }

              return await tx.testCase.findUnique({
                  where: { id: body.id },
                  include: { 
                      steps: { orderBy: { order: 'asc' } }, 
                      history: { 
                          orderBy: { date: 'desc' },
                          include: { defects: true }
                      } 
                  }
              });
          });
          
          if (!result) throw new Error("Update failed");

          return NextResponse.json({
              ...result,
              tags: safeParseTags(result.tags),
              history: result.history.map(h => ({ ...h, environment: h.env }))
          });
      } else {
          if (!body.title || !body.projectId) {
              return NextResponse.json({ error: "Title and Project ID are required" }, { status: 400 });
          }
          // Create
          const created = await prisma.testCase.create({
              data: {
                  ...basicPayload,
                  steps: {
                      create: body.steps?.map((s: StepPayload, i: number) => ({
                          action: s.action,
                          expected: s.expected,
                          order: i
                      })) || []
                  },
                  history: {
                      create: body.history?.map((h: HistoryPayload) => ({
                          date: h.date ? new Date(h.date) : new Date(),
                          status: h.status,
                          executedBy: h.executedBy,
                          notes: h.notes,
                          bugId: h.bugId,
                          env: h.environment || h.env,
                          evidence: h.evidence,
                          defects: {
                              create: h.defects?.map((d: DefectPayload) => ({
                                  externalId: d.externalId,
                                  tracker: d.tracker,
                                  severity: d.severity,
                                  status: d.status,
                                  url: d.url,
                                  summary: d.summary
                              })) || []
                          }
                      })) || []
                  }
              },
              include: { 
                  steps: true, 
                  history: {
                      include: { defects: true }
                  } 
              }
          });
          return NextResponse.json({
              ...created,
              tags: safeParseTags(created.tags),
              history: created.history.map(h => ({ ...h, environment: h.env }))
          }, { status: 201 });
      }
  } catch (error: unknown) {
      console.error("POST Error:", String(error));
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
    } catch (error: unknown) {
        console.error("PUT Error:", String(error));
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
    } catch (error: unknown) {
        console.error("DELETE Error:", String(error));
        return NextResponse.json({ error: "Failed to delete test case" }, { status: 500 });
    }
}