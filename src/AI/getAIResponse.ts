let GEMINI_API_KEY = "";
import { getGeminiResponse } from "./getGeminiResponse";
export async function getAIResponse(data: any, systemPrompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not set.");
  }
  return await getGeminiResponse(data, systemPrompt, GEMINI_API_KEY);
}
