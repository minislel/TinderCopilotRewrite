let GEMINI_API_KEY = "x";
let OPENROUTER_API_KEY = "sk-or-v1-xxx";
import { getGeminiResponse } from "./getGeminiResponse";
import { selectedProvider } from "@/background/background";
import { getOpenRouterResponse } from "./getOpenRouterResponse";
import { OpenRouterModel } from "./openrouterModelEnum";
export async function getAIResponse(data: any, systemPrompt: string) {
  try {
    if (selectedProvider == "gemini") {
      console.log("Using Gemini model");
      return await getGeminiResponse(data, systemPrompt, GEMINI_API_KEY);
    } else if (selectedProvider == "openrouter") {
      return await getOpenRouterResponse(
        data,
        systemPrompt,
        OPENROUTER_API_KEY,
        OpenRouterModel.MINIMAX
      );
    }
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
