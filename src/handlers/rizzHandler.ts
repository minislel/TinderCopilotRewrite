import {
  getThreadIdFromUrl,
  getXauthToken,
  generateMessageSolo,
  generateMessageGroupchat,
  sendMessageToContentScript,
  xauthToken,
  getGroupConversationPartners,
} from "@/background/background";

import { fetchMessagesFromAPI, fetchUserMatches } from "@/tinderAPI";
export async function handleRizz() {
  let Id = await getThreadIdFromUrl(true);
  if (!Id.includes("-")) {
    // Solo chat handling
    let idShort = await getThreadIdFromUrl(false);
    let token = await getXauthToken();
    let data = await fetchMessagesFromAPI(Id, token);
    let msg;
    if (data.length == 0) {
      msg = await generateMessageSolo(idShort);
    } else {
      msg = await generateMessageSolo(idShort, data);
    }
    return { message: msg };
  } else {
    // Group chat handling
    let messages = await fetchMessagesFromAPI(Id, xauthToken);
    let matches = await fetchUserMatches(xauthToken);
    let [buddyId, match1Id, match2Id] = await getGroupConversationPartners(
      matches,
      Id
    );
    let msg;
    console.log("Group chat IDs:", buddyId, match1Id, match2Id);
    if (messages.length == 0) {
      msg = await generateMessageGroupchat(buddyId, match1Id, match2Id);
    } else {
      msg = await generateMessageGroupchat(
        buddyId,
        match1Id,
        match2Id,
        messages
      );
    }
    return { message: msg };
  }
}
