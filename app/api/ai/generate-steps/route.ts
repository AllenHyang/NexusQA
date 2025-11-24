import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

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

    // Use non-streaming content generation for better stability in test environments
    // Streaming can sometimes cause buffering issues or truncated JSON which fails parsing
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("No content generated from AI");
    }

    // Return the full text at once
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain",
      },
    });

  } catch (error) {
    console.error("AI API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate steps" }), { status: 500 });
  }
}