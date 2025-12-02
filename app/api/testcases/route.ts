import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@/types'; // Import TestStatus

// Define interfaces for payload types
interface StepPayload {
    action: string;
    expected: string;
}

interface DefectPayload {
    id?: string;
    title?: string;
    severity?: string;
    status?: string;
    externalIssueId?: string;
    externalUrl?: string;
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
            internalRequirements: {
              select: { id: true, title: true, status: true, priority: true }
            },
            history: {
                orderBy: { date: 'desc' },
                include: { defects: true, attachments: true }
            },
          },
          orderBy: { createdAt: 'desc' }
      });
      
      const parsedCases = testCases.map(tc => ({
          ...tc,
          tags: safeParseTags(tc.tags),
          priority: normalizePriority(tc.priority),
          internalRequirements: tc.internalRequirements,
          history: tc.history.map(h => ({
              ...h,
              environment: h.env,
              defects: h.defects,
              attachments: h.attachments
          }))
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
              // 1. Update basic info with internalRequirements relation
              const updateData: Record<string, unknown> = { ...basicPayload };

              // Handle internalRequirements many-to-many relation
              if (body.internalRequirementIds !== undefined) {
                  updateData.internalRequirements = {
                      set: body.internalRequirementIds.map((id: string) => ({ id }))
                  };
              }

              await tx.testCase.update({
                  where: { id: body.id },
                  data: updateData
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
                                       create: h.defects?.filter(d => !d.id).map((d: DefectPayload) => ({
                                           title: d.title!,
                                           severity: d.severity || "MEDIUM",
                                           status: d.status || "OPEN",
                                           projectId: body.projectId,
                                           authorId: body.authorId,
                                           externalIssueId: d.externalIssueId,
                                           externalUrl: d.externalUrl
                                       })) || [],
                                       connect: h.defects?.filter(d => d.id).map((d: DefectPayload) => ({
                                            id: d.id
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
                      internalRequirements: {
                          select: { id: true, title: true, status: true, priority: true }
                      },
                      history: {
                          orderBy: { date: 'desc' },
                          include: { defects: true, attachments: true }
                      }
                  }
              });
          });

          if (!result) throw new Error("Update failed");

          return NextResponse.json({
              ...result,
              tags: safeParseTags(result.tags),
              internalRequirements: result.internalRequirements,
              history: result.history.map(h => ({ ...h, environment: h.env }))
          });
      } else {
          if (!body.title || !body.projectId) {
              return NextResponse.json({ error: "Title and Project ID are required" }, { status: 400 });
          }

          // Build create data with optional internalRequirements connection
          const createData: Record<string, unknown> = {
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
                           create: h.defects?.filter(d => !d.id).map((d: DefectPayload) => ({
                               title: d.title!,
                               severity: d.severity || "MEDIUM",
                               status: d.status || "OPEN",
                               projectId: body.projectId,
                               authorId: body.authorId,
                               externalIssueId: d.externalIssueId,
                               externalUrl: d.externalUrl
                           })) || [],
                           connect: h.defects?.filter(d => d.id).map((d: DefectPayload) => ({
                                id: d.id
                           })) || []
                      }
                  })) || []
              }
          };

          // Handle internalRequirements many-to-many relation on create
          if (body.internalRequirementIds && body.internalRequirementIds.length > 0) {
              createData.internalRequirements = {
                  connect: body.internalRequirementIds.map((id: string) => ({ id }))
              };
          }

          // Create
          const created = await prisma.testCase.create({
              data: createData,
              include: {
                  steps: true,
                  internalRequirements: {
                      select: { id: true, title: true, status: true, priority: true }
                  },
                  history: {
                      include: { defects: true, attachments: true }
                  }
              }
          });
          return NextResponse.json({
              ...created,
              tags: safeParseTags(created.tags),
              internalRequirements: created.internalRequirements,
              history: created.history.map(h => ({ ...h, environment: h.env }))
          }, { status: 201 });
      }
  } catch (error: unknown) {
      console.error("POST Error:", String(error));
      return NextResponse.json({ error: "Failed to save test case" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { ids, updates } = body;
        
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
    const ids = searchParams.get('ids');

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
