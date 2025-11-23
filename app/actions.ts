'use server';

import { GoogleGenAI, Type } from "@google/genai";
import { TestStep } from "@/types";

// Ensure API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

const getGeminiClient = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTestSteps = async (title: string, description: string): Promise<TestStep[]> => {
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
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, description: "The action the tester performs" },
              expected: { type: Type.STRING, description: "The expected result of the action" }
            },
            required: ["action", "expected"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    const rawSteps = JSON.parse(text);
    
    return rawSteps.map((s: any, i: number) => ({
      id: `step-${Date.now()}-${i}`,
      action: s.action,
      expected: s.expected
    }));
  } catch (e) {
    console.error("AI Gen Error", e);
    return [];
  }
};

export const generateImage = async (prompt: string, type: "project" | "reference"): Promise<string | null> => {
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

    // Handle image response structure for gemini-2.5-flash-image
    // The SDK might return base64 directly in inlineData
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (e: any) {
    console.error("Image Gen Error", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    return null;
  }
};

export const generateAvatar = async (name: string, role: string): Promise<string | null> => {
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
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e: any) {
    console.error("Avatar Gen Error", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    return null;
  }
};
