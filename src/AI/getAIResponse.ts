let GEMINI_API_KEY = "";
import { getGeminiResponse } from "./getGeminiResponse";
export async function getAIResponse(data: any, systemPrompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not set.");
  }
  try {
    return await getGeminiResponse(data, systemPrompt, GEMINI_API_KEY);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    const err = {
      name: "Error fetching AI response",
      message:
        error instanceof Error ? JSON.parse(error.message) : String(error),
      status:
        error instanceof Error && (error as any).status
          ? (error as any).status
          : 500,
      function: "getAIResponse",
    };
    throw err;
  }
}
