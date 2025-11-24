import { GoogleGenAI } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set" }), { status: 500 });
  }

  try {
    const { title, description } = await req.json();
    
    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a QA Expert. Create a comprehensive list of test steps for a test case titled: "${title}".
      Description: "${description}".
      
      Rules:
      1. Break down the test into logical, sequential steps.
      2. Each step must have a clear Action and an Expected Result.
      3. Keep the steps concise but detailed enough to be reproducible.
      4. If no specific description is provided, infer the most likely positive path scenarios based on the title.
      5. Generate between 3 to 8 steps.
      6. IMPORTANT: Output each test step as a single JSON object on a new line. Do NOT wrap the steps in a JSON array or markdown code block.
         Example:
         {"action": "Perform X", "expected": "See Y"}
         {"action": "Perform A", "expected": "See B"}
    `;

    const geminiStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Create a ReadableStream to pipe the AI response to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of geminiStream) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
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
    console.error("AI API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate steps" }), { status: 500 });
  }
}
