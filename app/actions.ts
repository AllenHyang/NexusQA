'use server';

import { GoogleGenAI } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

const getGeminiClient = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

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
