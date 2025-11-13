import { getAIResponse } from "@/background/AI/getAIResponse";
import { GeminiModel } from "@/background/AI/geminiModelEnum";

import {
  completionPromptSolo,
  completionPromptGroup,
} from "@/background/AI/prompts";
import { interceptStorage, getThreadId } from "@/background/background";

import { Profile } from "@/types";
export async function handleCompletion(data: { message: string }) {
  try {
    const Id = await getThreadId(true);
    console.log("Completion thread ID:", Id);

    const messages = interceptStorage.getMessages(Id)?.slice(0, 5) || [];
    console.log("Completion messages:", messages);
    console.log("Completion data message:", data);
    let aiResponse;
    if (!Id.includes("-")) {
      const IdShort = await getThreadId(false);
      const matchProfile: Profile | undefined =
        interceptStorage.getProfile(IdShort) || undefined;
      aiResponse = await getAIResponse(
        data,
        completionPromptSolo(
          messages,
          interceptStorage.userProfile.id,
          matchProfile
        ),
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
