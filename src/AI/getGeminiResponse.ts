import { GoogleGenAI } from "@google/genai";

export async function getGeminiResponse(
  data: any,
  systemPrompt: string,
  ApiKey?: string
) {
  const prompt = {
    contents: [{ role: "user", parts: [{ text: JSON.stringify(data) }] }],
  };
  const ai = new GoogleGenAI({ apiKey: ApiKey });
  const temp = 0.76 + Math.random() * 0.15;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt.contents,
    config: {
      temperature: temp,
      thinkingConfig: {
        thinkingBudget: 3,
      },
      systemInstruction: systemPrompt,
    },
  });

  return response.text;
}
