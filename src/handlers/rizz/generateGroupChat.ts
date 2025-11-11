import { Message } from "@/types";
import { fetchProfileData } from "@/tinderAPI";
import { getAIResponse } from "@/AI/getAIResponse";
import {
  firstMessageGroupChatPrompt,
  nextMessageGroupChatPrompt,
} from "@/AI/prompts";
import { xauthToken, userId, language } from "@/background/background";
export async function getGroupConversationPartners(
  matchList: any,
  matchId: string
): Promise<Array<string>> {
  let FoundMatch;
  let userIds: Array<string> = [];
  for (let match of matchList) {
    if (match._id === matchId) {
      FoundMatch = match;
      break;
    }
  }
  console.log("Found match for group chat:", FoundMatch);
  if (FoundMatch) {
    const allUniqueIds = [
      ...new Set(
        FoundMatch.other_group_participants.map((obj: any) => obj._id)
      ),
    ];
    const otherIds = allUniqueIds.filter(
      (id) => id !== FoundMatch.duo.partners[0]
    );
    userIds = [FoundMatch.duo.partners[0], ...otherIds];
  }
  console.log("Extracted user IDs for group chat:", userIds);
  return userIds;
}

export async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages?: Array<Message>
): Promise<string> {
  const buddyProfile = await fetchProfileData(buddyId, xauthToken);
  const match1Profile = await fetchProfileData(match1Id, xauthToken);
  const match2Profile = await fetchProfileData(match2Id, xauthToken);
  const userProfile = await fetchProfileData(userId, xauthToken);

  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getAIResponse(
      [...messages],
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
