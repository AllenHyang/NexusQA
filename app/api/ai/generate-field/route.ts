import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set" }), { status: 500 });
  }

  try {
    const { title, fieldType, context } = await req.json();

    if (!title || !fieldType) {
      return new Response(JSON.stringify({ error: "Title and Field Type are required" }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    
    switch(fieldType) {
        case "userStory":
            prompt = `You are a QA Expert. Generate a User Story for a test case titled "${title}".
            Format: "As a [role], I want to [action], so that [benefit]."
            Keep it concise. Do not add any other text.`;
            break;
        case "acceptanceCriteria":
            prompt = `You are a QA Expert. Generate Acceptance Criteria for a test case titled "${title}".
            Context: "${context || ''}".
            Format: List the criteria in Gherkin syntax (Given/When/Then) or a bulleted list.
            Keep it concise. Do not add any other text.`;
            break;
        case "preconditions":
            prompt = `You are a QA Expert. Generate Preconditions for a test case titled "${title}".
            Context: "${context || ''}".
            Format: Bulleted list of required state before testing.
            Keep it concise. Do not add any other text.`;
            break;
        default:
            return new Response(JSON.stringify({ error: "Invalid field type" }), { status: 400 });
    }

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
    console.error("AI Field Gen Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate text" }), { status: 500 });
  }
}
