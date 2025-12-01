import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define available tools/functions for the AI
const tools: FunctionDeclaration[] = [
  {
    name: "query_projects",
    description: "查询项目列表，可以获取所有项目或按条件筛选",
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: {
          type: Type.STRING,
          description: "搜索关键词（可选）",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回数量限制，默认10",
        },
      },
    },
  },
  {
    name: "query_test_cases",
    description: "查询测试用例，支持按项目、状态、优先级等条件筛选",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（可选）",
        },
        status: {
          type: Type.STRING,
          description: "状态筛选: UNTESTED, PASSED, FAILED, BLOCKED, SKIPPED",
        },
        priority: {
          type: Type.STRING,
          description: "优先级筛选: P0, P1, P2, P3",
        },
        search: {
          type: Type.STRING,
          description: "搜索标题或描述",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回数量限制，默认20",
        },
      },
    },
  },
  {
    name: "query_requirements",
    description: "查询需求列表，支持按项目、状态筛选",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（可选）",
        },
        status: {
          type: Type.STRING,
          description: "状态: DRAFT, PENDING_REVIEW, APPROVED, IN_PROGRESS, COMPLETED",
        },
        search: {
          type: Type.STRING,
          description: "搜索标题或描述",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回数量限制，默认20",
        },
      },
    },
  },
  {
    name: "query_defects",
    description: "查询缺陷/Bug列表",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（可选）",
        },
        status: {
          type: Type.STRING,
          description: "状态: OPEN, IN_PROGRESS, RESOLVED, CLOSED",
        },
        severity: {
          type: Type.STRING,
          description: "严重程度: LOW, MEDIUM, HIGH, CRITICAL",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回数量限制，默认20",
        },
      },
    },
  },
  {
    name: "query_test_plans",
    description: "查询测试计划",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（可选）",
        },
        status: {
          type: Type.STRING,
          description: "状态: PLANNED, ACTIVE, COMPLETED, ARCHIVED",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回数量限制，默认10",
        },
      },
    },
  },
  {
    name: "get_statistics",
    description: "获取统计数据，包括测试用例通过率、缺陷分布等",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（可选，不填则获取全局统计）",
        },
        type: {
          type: Type.STRING,
          description: "统计类型: overview, testcases, defects, requirements",
        },
      },
    },
  },
  {
    name: "create_test_case",
    description: "创建新的测试用例",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（必填）",
        },
        title: {
          type: Type.STRING,
          description: "测试用例标题（必填）",
        },
        description: {
          type: Type.STRING,
          description: "测试用例描述",
        },
        priority: {
          type: Type.STRING,
          description: "优先级: P0, P1, P2, P3",
        },
        preconditions: {
          type: Type.STRING,
          description: "前置条件",
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              expected: { type: Type.STRING },
            },
          },
          description: "测试步骤数组",
        },
      },
      required: ["projectId", "title"],
    },
  },
  {
    name: "create_requirement",
    description: "创建新的需求",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（必填）",
        },
        authorId: {
          type: Type.STRING,
          description: "作者ID（必填）",
        },
        title: {
          type: Type.STRING,
          description: "需求标题（必填）",
        },
        description: {
          type: Type.STRING,
          description: "需求描述",
        },
        priority: {
          type: Type.STRING,
          description: "优先级: P0, P1, P2, P3",
        },
        status: {
          type: Type.STRING,
          description: "状态: DRAFT, PENDING_REVIEW, APPROVED",
        },
      },
      required: ["projectId", "authorId", "title"],
    },
  },
  {
    name: "create_defect",
    description: "创建新的缺陷/Bug",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: "项目ID（必填）",
        },
        authorId: {
          type: Type.STRING,
          description: "作者ID（必填）",
        },
        title: {
          type: Type.STRING,
          description: "缺陷标题（必填）",
        },
        description: {
          type: Type.STRING,
          description: "缺陷描述",
        },
        severity: {
          type: Type.STRING,
          description: "严重程度: LOW, MEDIUM, HIGH, CRITICAL",
        },
      },
      required: ["projectId", "authorId", "title"],
    },
  },
  {
    name: "update_test_case",
    description: "更新测试用例（可以通过ID或标题查找）",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "测试用例ID（如果知道的话）",
        },
        searchTitle: {
          type: Type.STRING,
          description: "按标题搜索测试用例（如果不知道ID，用这个搜索）",
        },
        projectId: {
          type: Type.STRING,
          description: "项目ID（配合searchTitle使用，缩小搜索范围）",
        },
        newTitle: {
          type: Type.STRING,
          description: "新标题",
        },
        description: {
          type: Type.STRING,
          description: "新描述",
        },
        status: {
          type: Type.STRING,
          description: "新状态: UNTESTED, PASSED, FAILED, BLOCKED, SKIPPED",
        },
        priority: {
          type: Type.STRING,
          description: "新优先级: P0, P1, P2, P3",
        },
        requirementId: {
          type: Type.STRING,
          description: "关联的需求ID（用于给测试用例增加编号/关联需求）",
        },
      },
    },
  },
  {
    name: "update_defect",
    description: "更新缺陷状态或信息",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "缺陷ID（必填）",
        },
        status: {
          type: Type.STRING,
          description: "新状态: OPEN, IN_PROGRESS, RESOLVED, CLOSED",
        },
        severity: {
          type: Type.STRING,
          description: "新严重程度",
        },
        description: {
          type: Type.STRING,
          description: "更新描述",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_test_case",
    description: "删除测试用例（谨慎操作）",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "测试用例ID（必填）",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "query_users",
    description: "查询系统用户列表",
    parameters: {
      type: Type.OBJECT,
      properties: {
        role: {
          type: Type.STRING,
          description: "角色筛选: ADMIN, QA_LEAD, TESTER, PM, DEVELOPER",
        },
        limit: {
          type: Type.NUMBER,
          description: "返回数量限制，默认20",
        },
      },
    },
  },
];

// Function to execute tool calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeTool(name: string, args: any): Promise<string> {
  try {
    switch (name) {
      case "query_projects": {
        const where: { name?: { contains: string } } = {};
        if (args.search) {
          where.name = { contains: args.search };
        }
        const projects = await prisma.project.findMany({
          where,
          take: args.limit || 10,
          include: {
            _count: {
              select: { testCases: true, defects: true, internalRequirements: true },
            },
          },
        });
        return JSON.stringify(projects);
      }

      case "query_test_cases": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (args.projectId) where.projectId = args.projectId;
        if (args.status) where.status = args.status;
        if (args.priority) where.priority = args.priority;
        if (args.search) {
          where.OR = [
            { title: { contains: args.search } },
            { description: { contains: args.search } },
          ];
        }
        const testCases = await prisma.testCase.findMany({
          where,
          take: args.limit || 20,
          include: {
            project: { select: { name: true } },
            steps: true,
            author: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
        });
        return JSON.stringify(testCases);
      }

      case "query_requirements": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (args.projectId) where.projectId = args.projectId;
        if (args.status) where.status = args.status;
        if (args.search) {
          where.OR = [
            { title: { contains: args.search } },
            { description: { contains: args.search } },
          ];
        }
        const requirements = await prisma.internalRequirement.findMany({
          where,
          take: args.limit || 20,
          include: {
            project: { select: { name: true } },
            author: { select: { name: true } },
            _count: { select: { testCases: true } },
          },
          orderBy: { updatedAt: "desc" },
        });
        return JSON.stringify(requirements);
      }

      case "query_defects": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (args.projectId) where.projectId = args.projectId;
        if (args.status) where.status = args.status;
        if (args.severity) where.severity = args.severity;
        const defects = await prisma.defect.findMany({
          where,
          take: args.limit || 20,
          include: {
            project: { select: { name: true } },
            author: { select: { name: true } },
            assignee: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
        });
        return JSON.stringify(defects);
      }

      case "query_test_plans": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (args.projectId) where.projectId = args.projectId;
        if (args.status) where.status = args.status;
        const plans = await prisma.testPlan.findMany({
          where,
          take: args.limit || 10,
          include: {
            project: { select: { name: true } },
            _count: { select: { runs: true } },
          },
          orderBy: { updatedAt: "desc" },
        });
        return JSON.stringify(plans);
      }

      case "get_statistics": {
        const projectFilter = args.projectId ? { projectId: args.projectId } : {};

        if (args.type === "testcases" || !args.type || args.type === "overview") {
          const totalCases = await prisma.testCase.count({ where: projectFilter });
          const passedCases = await prisma.testCase.count({
            where: { ...projectFilter, status: "PASSED" },
          });
          const failedCases = await prisma.testCase.count({
            where: { ...projectFilter, status: "FAILED" },
          });
          const blockedCases = await prisma.testCase.count({
            where: { ...projectFilter, status: "BLOCKED" },
          });
          const untestedCases = await prisma.testCase.count({
            where: { ...projectFilter, status: "UNTESTED" },
          });

          if (args.type === "testcases") {
            return JSON.stringify({
              total: totalCases,
              passed: passedCases,
              failed: failedCases,
              blocked: blockedCases,
              untested: untestedCases,
              passRate: totalCases > 0 ? ((passedCases / totalCases) * 100).toFixed(1) + "%" : "N/A",
            });
          }
        }

        if (args.type === "defects" || !args.type || args.type === "overview") {
          const totalDefects = await prisma.defect.count({ where: projectFilter });
          const openDefects = await prisma.defect.count({
            where: { ...projectFilter, status: "OPEN" },
          });
          const inProgressDefects = await prisma.defect.count({
            where: { ...projectFilter, status: "IN_PROGRESS" },
          });
          const resolvedDefects = await prisma.defect.count({
            where: { ...projectFilter, status: "RESOLVED" },
          });
          const closedDefects = await prisma.defect.count({
            where: { ...projectFilter, status: "CLOSED" },
          });

          if (args.type === "defects") {
            return JSON.stringify({
              total: totalDefects,
              open: openDefects,
              inProgress: inProgressDefects,
              resolved: resolvedDefects,
              closed: closedDefects,
            });
          }
        }

        if (args.type === "requirements" || !args.type || args.type === "overview") {
          const totalReqs = await prisma.internalRequirement.count({ where: projectFilter });
          const draftReqs = await prisma.internalRequirement.count({
            where: { ...projectFilter, status: "DRAFT" },
          });
          const approvedReqs = await prisma.internalRequirement.count({
            where: { ...projectFilter, status: "APPROVED" },
          });

          if (args.type === "requirements") {
            return JSON.stringify({
              total: totalReqs,
              draft: draftReqs,
              approved: approvedReqs,
            });
          }
        }

        // Overview: return all stats
        const totalCases = await prisma.testCase.count({ where: projectFilter });
        const passedCases = await prisma.testCase.count({
          where: { ...projectFilter, status: "PASSED" },
        });
        const totalDefects = await prisma.defect.count({ where: projectFilter });
        const openDefects = await prisma.defect.count({
          where: { ...projectFilter, status: "OPEN" },
        });
        const totalReqs = await prisma.internalRequirement.count({ where: projectFilter });
        const totalProjects = await prisma.project.count();

        return JSON.stringify({
          projects: totalProjects,
          testCases: {
            total: totalCases,
            passed: passedCases,
            passRate: totalCases > 0 ? ((passedCases / totalCases) * 100).toFixed(1) + "%" : "N/A",
          },
          defects: {
            total: totalDefects,
            open: openDefects,
          },
          requirements: {
            total: totalReqs,
          },
        });
      }

      case "create_test_case": {
        const testCase = await prisma.testCase.create({
          data: {
            projectId: args.projectId,
            title: args.title,
            description: args.description || null,
            priority: args.priority || "P2",
            preconditions: args.preconditions || null,
            status: "UNTESTED",
            steps: args.steps
              ? {
                  create: args.steps.map((s: { action: string; expected: string }, i: number) => ({
                    action: s.action,
                    expected: s.expected,
                    order: i,
                  })),
                }
              : undefined,
          },
          include: { steps: true },
        });
        return JSON.stringify({ success: true, testCase });
      }

      case "create_requirement": {
        const requirement = await prisma.internalRequirement.create({
          data: {
            projectId: args.projectId,
            authorId: args.authorId,
            title: args.title,
            description: args.description || null,
            priority: args.priority || "P2",
            status: args.status || "DRAFT",
          },
        });
        return JSON.stringify({ success: true, requirement });
      }

      case "create_defect": {
        const defect = await prisma.defect.create({
          data: {
            projectId: args.projectId,
            authorId: args.authorId,
            title: args.title,
            description: args.description || null,
            severity: args.severity || "MEDIUM",
            status: "OPEN",
          },
        });
        return JSON.stringify({ success: true, defect });
      }

      case "update_test_case": {
        let testCaseId = args.id;

        // 如果没有提供 ID，尝试通过标题搜索
        if (!testCaseId && args.searchTitle) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const searchWhere: any = {
            title: { contains: args.searchTitle }
          };
          if (args.projectId) {
            searchWhere.projectId = args.projectId;
          }

          const foundCases = await prisma.testCase.findMany({
            where: searchWhere,
            take: 5,
            select: { id: true, title: true, projectId: true, status: true }
          });

          if (foundCases.length === 0) {
            return JSON.stringify({
              success: false,
              error: `未找到标题包含 "${args.searchTitle}" 的测试用例`,
              suggestion: "请检查标题是否正确，或尝试使用更精确的关键词"
            });
          }

          if (foundCases.length === 1) {
            testCaseId = foundCases[0].id;
          } else {
            // 多个匹配，返回列表让用户选择
            return JSON.stringify({
              success: false,
              error: "找到多个匹配的测试用例，请提供更精确的标题或直接使用ID",
              matches: foundCases
            });
          }
        }

        if (!testCaseId) {
          return JSON.stringify({
            success: false,
            error: "请提供测试用例ID或搜索标题"
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {};
        if (args.newTitle) data.title = args.newTitle;
        if (args.description !== undefined) data.description = args.description;
        if (args.status) data.status = args.status;
        if (args.priority) data.priority = args.priority;
        if (args.requirementId) data.requirementId = args.requirementId;

        const updated = await prisma.testCase.update({
          where: { id: testCaseId },
          data,
          include: {
            project: { select: { name: true } },
          }
        });
        return JSON.stringify({ success: true, testCase: updated, message: `测试用例 "${updated.title}" 已更新` });
      }

      case "update_defect": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {};
        if (args.status) data.status = args.status;
        if (args.severity) data.severity = args.severity;
        if (args.description !== undefined) data.description = args.description;

        const updated = await prisma.defect.update({
          where: { id: args.id },
          data,
        });
        return JSON.stringify({ success: true, defect: updated });
      }

      case "delete_test_case": {
        await prisma.testCase.delete({ where: { id: args.id } });
        return JSON.stringify({ success: true, message: "测试用例已删除" });
      }

      case "query_users": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (args.role) where.role = args.role;
        const users = await prisma.user.findMany({
          where,
          take: args.limit || 20,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });
        return JSON.stringify(users);
      }

      default:
        return JSON.stringify({ error: "Unknown function" });
    }
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    return JSON.stringify({ error: `执行失败: ${(error as Error).message}` });
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set" }), {
      status: 500,
    });
  }

  try {
    const { messages, currentUserId, currentProjectId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build system context
    let systemContext = `你是 NexusQA 测试管理系统的智能助手。你的任务是帮助用户高效管理测试数据。

## 核心原则：直接行动，不要反问

当用户给出明确指令时，立即执行，不要询问ID或其他信息。

## 理解用户意图的例子

用户说："验证文件夹名称及类型设置的边界条件 未测试 这个测试，增加一个编号"
→ 理解：用户想给标题为"验证文件夹名称及类型设置的边界条件"的测试用例添加编号
→ 行动：调用 update_test_case，searchTitle="验证文件夹名称及类型设置的边界条件"，newTitle="TC-XXX 验证文件夹名称及类型设置的边界条件"

用户说："把这个测试用例状态改成通过"
→ 行动：调用 update_test_case，searchTitle=上下文中的测试用例名，status="PASSED"

用户说："创建一个登录测试用例"
→ 行动：调用 create_test_case，使用当前项目ID

## 可用工具
- query_test_cases: 查询测试用例（支持按标题搜索）
- update_test_case: 更新测试用例（用 searchTitle 按标题查找，无需ID）
- create_test_case: 创建测试用例
- query_requirements/query_defects/query_projects: 查询数据
- get_statistics: 获取统计

## 重要
1. 用户提到测试用例名称时，直接用 searchTitle 查找并操作
2. 使用当前项目ID（如果提供）
3. 中文回复
4. 操作成功后简洁告知结果`;

    if (currentProjectId) {
      systemContext += `\n\n当前用户正在操作的项目ID: ${currentProjectId}`;
    }
    if (currentUserId) {
      systemContext += `\n当前用户ID: ${currentUserId}`;
    }

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Create chat session with function calling
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: systemContext,
        tools: [{ functionDeclarations: tools }],
      },
      history: geminiMessages.slice(0, -1),
    });

    // Get the latest user message
    const latestMessage = geminiMessages[geminiMessages.length - 1];

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send message and handle function calls
          let response = await (await chat).sendMessage({
            message: latestMessage.parts[0].text,
          });

          // Handle function calls in a loop
          while (response.functionCalls && response.functionCalls.length > 0) {
            const functionResponses = [];

            for (const call of response.functionCalls) {
              // Notify user about the function being called
              controller.enqueue(
                encoder.encode(`\n正在执行: ${call.name}...\n`)
              );

              const result = await executeTool(call.name!, call.args as Record<string, unknown>);
              functionResponses.push({
                name: call.name!,
                response: { result },
              });
            }

            // Send function results back to the model
            response = await (await chat).sendMessage({
              message: functionResponses.map(fr => ({
                functionResponse: {
                  name: fr.name,
                  response: fr.response,
                },
              })),
            });
          }

          // Stream the final text response
          if (response.text) {
            controller.enqueue(encoder.encode(response.text));
          }

          controller.close();
        } catch (error) {
          console.error("Chat error:", error);
          controller.enqueue(
            encoder.encode(`\n抱歉，处理您的请求时出现错误: ${(error as Error).message}`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500 }
    );
  }
}
