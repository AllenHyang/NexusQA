'use server';

import { GoogleGenAI } from "@google/genai";
import { TestStep } from "@/types";

// Ensure API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

const getGeminiClient = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function* generateTestSteps(title: string, description: string): AsyncGenerator<TestStep | { error: string }, void, void> {
  try {
    const ai = getGeminiClient();
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

    const response = await ai.models.generateContentStream({
      model: "gemini-pro", // Changed to gemini-pro for better structured text output
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // Removed responseMimeType and responseSchema to get raw text stream
    });

    let accumulatedText = '';
    let stepCounter = 0;

    for await (const chunk of response) {
      accumulatedText += chunk.text;
      
      const lines = accumulatedText.split('\n');
      accumulatedText = lines.pop() || ''; // Keep last potentially incomplete line

      for (const line of lines) {
        if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
          try {
            const parsedStep = JSON.parse(line.trim()) as { action: string; expected: string };
            if (parsedStep.action && parsedStep.expected) {
              const newStep: TestStep = {
                id: `step-${Date.now()}-${stepCounter++}`, // Unique ID
                action: parsedStep.action,
                expected: parsedStep.expected,
              };
              yield newStep; // Yield each complete step
            }
          } catch {
            // Ignore parsing errors for incomplete lines
          }
        }
      }
    } // This closes the 'for await' loop (line 43)
  } catch (error: unknown) { // This catch block now correctly follows the 'try' block (line 18)
    console.error("AI Streaming Gen Error", String(error));
    yield { error: "Failed to generate test steps. Please try again." }; // Yield error object
  }
}

export const generateImage = async (prompt: string, type: "project" | "reference"): Promise<{ data?: string; error?: string }> => {
  try {
    const ai = getGeminiClient();
    // Optimized prompts for better results with Nano Banana models + Light Theme Compatibility
    const fullPrompt = type === "project"
      ? `Minimalist 3D abstract tech icon representing ${prompt}. Soft studio lighting, white or light grey background, high quality, clean lines, soft shadows. Style: Modern, Apple-esque.`
      : `A high-fidelity software interface mockup showing ${prompt}. Professional UI design, clean layout, light mode, white background, grey text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: fullPrompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return { data: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
        }
    }
    return { error: "No image data received from AI." };
  } catch (error: unknown) {
    console.error("Image Gen Error", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return { error: `Failed to generate image: ${String(error)}` };
  }
};

export const generateAvatar = async (name: string, role: string): Promise<{ data?: string; error?: string }> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Professional photorealistic headshot of ${name}, a tech professional working as ${role}. High quality, 8k, studio lighting, neutral bright background, looking at camera, confident expression.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: prompt,
      config: {
        responseMimeType: "image/jpeg",
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { data: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
      }
    }
    return { error: "No avatar data received from AI." };
  } catch (error: unknown) {
    console.error("Avatar Gen Error", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return { error: `Failed to generate avatar: ${String(error)}` };
  }
};
