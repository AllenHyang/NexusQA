import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set" }), { status: 500 });
  }

  try {
    const { title, description, fieldType, context } = await req.json();

    if (!fieldType) {
      return new Response(JSON.stringify({ error: "Field type is required" }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt = "";
    const titleContext = title ? `标题: "${title}"` : "";
    const descContext = description ? `\n描述: "${description}"` : "";
    const additionalContext = context ? `\n补充信息: "${context}"` : "";

    switch(fieldType) {
      case "userStory":
        prompt = `你是一位专业的产品经理和需求分析师。请为以下需求生成用户故事。
${titleContext}${descContext}${additionalContext}

要求:
1. 使用标准的用户故事格式: "作为[用户角色]，我希望[功能/目标]，以便[价值/原因]"
2. 用户角色要具体明确
3. 功能目标要清晰可实现
4. 价值原因要体现业务价值
5. 如果需求复杂，可以生成2-3个相关的用户故事，每个故事之间用空行分隔

直接输出用户故事内容，不要添加任何解释或标题。`;
        break;

      case "acceptanceCriteria":
        prompt = `你是一位专业的QA工程师和需求分析师。请为以下需求生成验收标准。
${titleContext}${descContext}${additionalContext}

要求:
1. 每个验收标准必须是具体、可测试、可验证的
2. 覆盖正常流程和主要异常场景
3. 使用简洁明确的描述
4. 生成3-6个验收标准
5. 每个标准单独一行，不需要编号

格式示例:
用户可以通过邮箱登录系统
登录失败时显示明确的错误提示
连续3次登录失败后账户被临时锁定

直接输出验收标准，不要添加任何解释或标题。`;
        break;

      case "businessRules":
        prompt = `你是一位专业的业务分析师。请为以下需求生成业务规则。
${titleContext}${descContext}${additionalContext}

要求:
1. 每条规则必须明确、无歧义
2. 规则应该包含条件和结果
3. 覆盖边界条件和特殊情况
4. 生成3-5条业务规则

输出格式(JSON数组):
[
  {"code": "BR-001", "description": "规则描述"},
  {"code": "BR-002", "description": "规则描述"}
]

只输出JSON数组，不要添加任何其他内容。`;
        break;

      case "testCaseSuggestions":
        prompt = `你是一位资深的测试工程师。请根据以下需求推荐应该创建的测试用例。
${titleContext}${descContext}${additionalContext}

要求:
1. 覆盖正常流程(Happy Path)
2. 覆盖异常和边界情况
3. 考虑安全性和性能测试场景
4. 每个测试用例建议包含标题和简要描述
5. 生成5-8个测试用例建议

输出格式(JSON数组):
[
  {"title": "测试用例标题", "description": "简要描述测试目的和关键步骤", "priority": "HIGH|MEDIUM|LOW"},
  ...
]

只输出JSON数组，不要添加任何其他内容。`;
        break;

      case "preconditions":
        prompt = `你是一位专业的需求分析师。请为以下需求生成前置条件。
${titleContext}${descContext}${additionalContext}

要求:
1. 列出实现该需求前必须满足的条件
2. 包括系统状态、用户权限、数据准备等
3. 条件要具体明确
4. 生成3-5个前置条件

格式: 每个条件单独一行，使用"- "开头

直接输出前置条件，不要添加任何解释或标题。`;
        break;

      case "refineDescription":
        prompt = `你是一位专业的产品经理。请优化和完善以下需求描述，使其更加清晰、完整、专业。
${titleContext}${descContext}${additionalContext}

要求:
1. 保持原有含义不变
2. 补充必要的细节
3. 使用清晰的结构
4. 消除歧义
5. 适当使用Markdown格式增强可读性

直接输出优化后的需求描述，不要添加任何解释。`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid field type" }), { status: 400 });
    }

    // Use streaming for longer content
    const geminiStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("AI Requirement Gen Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate content" }), { status: 500 });
  }
}
