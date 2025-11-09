import {
  getThreadIdFromUrl,
  generateMessageSolo,
  generateMessageGroupchat,
  xauthToken,
  getGroupConversationPartners,
  sendMessageToContentScript,
} from "@/background/background";
import { serializeError } from "@/utils/serializeError";

import { fetchMessagesFromAPI, fetchUserMatches } from "@/tinderAPI";
export async function handleRizz() {
  const Id = await getThreadIdFromUrl(true);
  try {
    if (!Id.includes("-")) {
      // Solo chat handling
      const idShort = await getThreadIdFromUrl(false);
      const data = await fetchMessagesFromAPI(Id, xauthToken);
      let msg;
      if (data.length === 0) {
        msg = await generateMessageSolo(idShort);
      } else {
        msg = await generateMessageSolo(idShort, data);
      }
      return { message: msg };
    } else {
      // Group chat handling
      const messages = await fetchMessagesFromAPI(Id, xauthToken);
      const matches = await fetchUserMatches(xauthToken);
      const [buddyId, match1Id, match2Id] = await getGroupConversationPartners(
        matches,
        Id
      );
      let msg;
      console.log("Group chat IDs:", buddyId, match1Id, match2Id);
      if (messages.length === 0) {
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
  } catch (error: any) {
    console.error("Error in handleRizz:", error);
    sendMessageToContentScript("Error", {
      message: `Failed to generate rizz message. Error in function ${error.function}. Please try again, or see console for details.`,
      function: "Rizz",
      errorMessage: serializeError(error),
    });
  }
}
