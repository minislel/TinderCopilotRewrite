import {
  getThreadIdFromUrl,
  xauthToken,
  sendMessageToContentScript,
} from "@/background/background";
import { serializeError } from "@/utils/serializeError";
import { generateMessageSolo } from "./generateSolo";
import {
  generateMessageGroupchat,
  getGroupConversationPartners,
} from "./generateGroupChat";
import { fetchMessagesFromAPI, fetchUserMatches } from "@/tinderAPI";
import {
  matchIntercepts,
  matchListIntercepts,
  profileIntercepts,
  userIntercepts,
  groupConversationsIntercepts,
  fetchIntercepts,
  duoMatchList,
  userProfile,
} from "@/fetchInterception/fetchResponseStorage";
export async function handleRizz() {
  const Id = await getThreadIdFromUrl(true);
  try {
    console.log("matchIntercepts:", [...matchIntercepts]);
    console.log("matchListIntercepts:", [...matchListIntercepts]);
    console.log("profileIntercepts:", [...profileIntercepts]);
    console.log("userIntercepts:", [...userIntercepts]);
    console.log("groupConversationsIntercepts:", [
      ...groupConversationsIntercepts,
    ]);
    console.log("fetchIntercepts:", [...fetchIntercepts]);
    console.log("DuoMatchList:", [...duoMatchList]);
    console.log("UserProfile:", userProfile);
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
    let msg = `Failed to generate rizz message. Error in function ${error.function}. Please try again, or see console for details.`;
    if (error.function === "getAIResponse") {
      msg = `Failed to generate rizz message. Error in function ${error.function}. Please try again, check your AI provider settings/API key, or see console for details.`;
    }

    sendMessageToContentScript("Error", {
      message: msg,
      function: "Rizz",
      errorMessage: serializeError(error),
    });
  }
}
