import { Message } from "@/types";

import { getAIResponse } from "@/background/AI/getAIResponse";
import {
  firstMessageSoloPrompt,
  nextMessageSoloPrompt,
} from "@/background/AI/prompts";
import { language, interceptStorage } from "@/background/background";

export async function generateMessageSolo(
  matchId: string,
  messages?: Array<Message>
): Promise<string> {
  const matchProfile = interceptStorage.getProfile(matchId.trim()) || "NONE";
  console.log("Match Profile:", matchProfile);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getAIResponse(
      [...messages].slice(0, 30),
      nextMessageSoloPrompt(
        interceptStorage.userProfile.id,
        matchProfile,
        interceptStorage.userProfile
      ) as string
    );
  } else {
    messageResponse = await getAIResponse(
      [],
      firstMessageSoloPrompt(
        language,
        matchProfile,
        interceptStorage.userProfile
      )
    );
  }
  return messageResponse as string;
}
