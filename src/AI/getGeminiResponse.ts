import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "./geminiModelEnum";
export async function getGeminiResponse(
  data: any,
  systemPrompt: string,
  ApiKey?: string,
  Model?: GeminiModel,
  ThinkingBudget?: number
) {
  const prompt = {
    contents: [{ role: "user", parts: [{ text: JSON.stringify(data) }] }],
  };
  const ai = new GoogleGenAI({ apiKey: ApiKey });

  console.log("Generating Gemini response with model:", Model);
  let budget = 128;
  if (Model?.includes("pro")) {
    budget = 512;
  }
  console.log("Using thinking budget:", ThinkingBudget);
  const temp = 0.76 + Math.random() * 0.15;
  const response = await ai.models.generateContent({
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

  return response.text;
}
