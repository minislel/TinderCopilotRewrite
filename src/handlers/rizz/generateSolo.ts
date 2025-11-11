import { Message } from "@/types";
import { fetchProfileData } from "@/tinderAPI";
import { getAIResponse } from "@/AI/getAIResponse";
import { firstMessageSoloPrompt, nextMessageSoloPrompt } from "@/AI/prompts";
import { xauthToken, userId, language } from "@/background/background";
export async function generateMessageSolo(
  matchId: string,
  messages?: Array<Message>
): Promise<string> {
  const matchProfile = await fetchProfileData(matchId, xauthToken);
  const userProfile = await fetchProfileData(userId, xauthToken);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getAIResponse(
      [...messages],
      nextMessageSoloPrompt(userId, matchProfile, userProfile) as string
    );
  } else {
    messageResponse = await getAIResponse(
      [],
      firstMessageSoloPrompt(language, matchProfile, userProfile)
    );
  }
  return messageResponse as string;
}
