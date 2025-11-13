import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "./geminiModelEnum";
export async function getGeminiResponse(
  data: any,
  systemPrompt: string,
  ApiKey?: string,
  Model?: GeminiModel,
  ThinkingBudget?: number,
  MaxTokens?: number
) {
  const prompt = {
    contents: [{ role: "user", parts: [{ text: JSON.stringify(data) }] }],
  };
  const ai = new GoogleGenAI({ apiKey: ApiKey });

  let budget = 128;
  if (Model?.includes("pro")) {
    budget = 512;
  }
  const temp = 0.76 + Math.random() * 0.15;
  let response;
  if (MaxTokens && MaxTokens > 0) {
    response = await ai.models.generateContent({
      model: Model || "models/gemini-2.5-flash",
      contents: prompt.contents,
      config: {
        temperature: temp,
        maxOutputTokens: MaxTokens,
        thinkingConfig: {
          thinkingBudget: ThinkingBudget || -1,
        },
        systemInstruction: systemPrompt,
      },
    });
  } else {
    response = await ai.models.generateContent({
      model: Model || "models/gemini-2.5-flash",
      contents: prompt.contents,
      config: {
        temperature: temp,
        thinkingConfig: {
          thinkingBudget: ThinkingBudget || -1,
        },
        systemInstruction: systemPrompt,
      },
    });
  }

  return response.text;
}
