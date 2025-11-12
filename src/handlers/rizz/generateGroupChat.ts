import { Message } from "@/types";

import { getAIResponse } from "@/AI/getAIResponse";
import {
  firstMessageGroupChatPrompt,
  nextMessageGroupChatPrompt,
} from "@/AI/prompts";
import { language, interceptStorage } from "@/background/background";

export async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages?: Array<Message>
): Promise<string> {
  const buddyProfile = interceptStorage.getProfile(buddyId) || "";
  const match1Profile = interceptStorage.getProfile(match1Id) || "";
  const match2Profile = interceptStorage.getProfile(match2Id) || "";
  console.log("Buddy Profile:", buddyProfile);
  console.log("Match1 Profile:", match1Profile);
  console.log("Match2 Profile:", match2Profile);
  console.log("User Profile:", interceptStorage.userProfile);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getAIResponse(
      [...messages].slice(0, 30),
      nextMessageGroupChatPrompt(
        buddyProfile,
        match1Profile,
        match2Profile,
        interceptStorage.userProfile
      )
    );
  } else {
    messageResponse = await getAIResponse(
      [],
      firstMessageGroupChatPrompt(
        language,
        buddyProfile,
        match1Profile,
        match2Profile,
        interceptStorage.userProfile
      )
    );
  }

  return messageResponse as string;
}
