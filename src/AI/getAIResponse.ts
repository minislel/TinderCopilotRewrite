import { getGeminiResponse } from "./getGeminiResponse";
import { getOpenRouterResponse } from "./getOpenRouterResponse";
import { OpenRouterModel } from "./openrouterModelEnum";
import { AIProvider } from "./AIProviderEnum";
import { ErrorResponse } from "@/types/error";
import { GeminiModel } from "./geminiModelEnum";
export async function getAIResponse(data: any, systemPrompt: string) {
  try {
    let selectedProvider: AIProvider = AIProvider.OPENROUTER;
    let providerResult = await chrome.storage.local.get("aiProvider");
    selectedProvider = providerResult.aiProvider || AIProvider.OPENROUTER;
    if (selectedProvider == AIProvider.GEMINI.valueOf()) {
      const result = await chrome.storage.local.get([
        "geminiApiKey",
        "geminiModel",
        "geminiThinkingBudget",
      ]);
      const GEMINI_API_KEY = result.geminiApiKey || "";
      const GEMINI_MODEL = result.geminiModel || GeminiModel.GeminiFlashLatest;
      const GEMINI_THINKING_BUDGET = result.geminiThinkingBudget || -1;
      console.log("data sent to Gemini:", data);
      console.log("systemPrompt sent to Gemini:", systemPrompt);
      return await getGeminiResponse(
        data,
        systemPrompt,
        GEMINI_API_KEY,
        GEMINI_MODEL,
        GEMINI_THINKING_BUDGET
      );
    } else if (selectedProvider == AIProvider.OPENROUTER.valueOf()) {
      let OPENROUTER_API_KEY: string = "";
      let OPENROUTER_MODEL: OpenRouterModel = OpenRouterModel.MINIMAX;
      const configResult = await chrome.storage.local.get([
        "openRouterApiKey",
        "openRouterModel",
      ]);
      OPENROUTER_API_KEY = configResult.openRouterApiKey || "";
      OPENROUTER_MODEL =
        configResult.openRouterModel || OpenRouterModel.MINIMAX;

      return await getOpenRouterResponse(
        data,
        systemPrompt,
        OPENROUTER_API_KEY,
        OpenRouterModel.MINIMAX
      );
    }
  } catch (error) {
    const err: ErrorResponse = {
      name: "Error fetching AI response",
      message: error instanceof Error ? error.message : String(error),
      status: (error as any).status,
      function: "getAIResponse",
    };
    console.error("Error fetching AI response:", err);
    throw err;
  }
}
