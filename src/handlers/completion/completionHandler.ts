import { getAIResponse } from "@/AI/getAIResponse";
import { GeminiModel } from "@/AI/geminiModelEnum";
import type { Message } from "@/types/message";
import { completionPromptSolo, completionPromptGroup } from "@/AI/prompts";
import { getThreadIdFromUrl, interceptStorage } from "@/background/background";
export async function handleCompletion(data: { message: string }) {
  try {
    const Id = await getThreadIdFromUrl(true);

    const messages = interceptStorage.getMessages(Id)?.slice(0, 5) || [];
    console.log("Completion messages:", messages);
    console.log("Completion data message:", data);
    let aiResponse;
    if (!Id.includes("-")) {
      aiResponse = await getAIResponse(
        data,
        completionPromptSolo(messages, interceptStorage.userProfile.id),
        GeminiModel.GeminiFlashLatest,
        512,
        70
      );
    } else {
      aiResponse = await getAIResponse(
        data,
        completionPromptGroup(messages, interceptStorage.userProfile.id),
        GeminiModel.GeminiFlashLatest,
        512,
        70
      );
    }
    console.log("AI Response:", aiResponse);
    return aiResponse;
  } catch (error) {
    console.error("Error in handleCompletion:", error);
    throw error;
  }
}
