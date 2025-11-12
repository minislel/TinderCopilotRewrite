import { Message } from "@/types";

import { getAIResponse } from "@/AI/getAIResponse";
import { firstMessageSoloPrompt, nextMessageSoloPrompt } from "@/AI/prompts";
import { language } from "@/background/background";
import {
  profilesList,
  userProfile,
} from "@/fetchInterception/fetchResponseStorage";
export async function generateMessageSolo(
  matchId: string,
  messages?: Array<Message>
): Promise<string> {
  const matchProfile = profilesList.get(matchId) || "NONE";
  console.log("Match Profile:", matchProfile);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getAIResponse(
      [...messages].slice(0, 30),
      nextMessageSoloPrompt(userProfile.id, matchProfile, userProfile) as string
    );
  } else {
    messageResponse = await getAIResponse(
      [],
      firstMessageSoloPrompt(language, matchProfile, userProfile)
    );
  }
  return messageResponse as string;
}
