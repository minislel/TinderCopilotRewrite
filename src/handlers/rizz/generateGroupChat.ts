import { Message } from "@/types";

import { getAIResponse } from "@/AI/getAIResponse";
import {
  firstMessageGroupChatPrompt,
  nextMessageGroupChatPrompt,
} from "@/AI/prompts";
import { language } from "@/background/background";
import {
  duoMatchList,
  profilesList,
  groupConversationsList,
  userProfile,
} from "@/fetchInterception/fetchResponseStorage";
import { Profile } from "@/types/profile";

export async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages?: Array<Message>
): Promise<string> {
  const buddyProfile = profilesList.get(buddyId) || "";
  const match1Profile = profilesList.get(match1Id) || "";
  const match2Profile = profilesList.get(match2Id) || "";
  console.log("Buddy Profile:", buddyProfile);
  console.log("Match1 Profile:", match1Profile);
  console.log("Match2 Profile:", match2Profile);
  console.log("User Profile:", userProfile);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getAIResponse(
      [...messages].slice(0, 30),
      nextMessageGroupChatPrompt(
        buddyProfile,
        match1Profile,
        match2Profile,
        userProfile
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
        userProfile
      )
    );
  }

  return messageResponse as string;
}
