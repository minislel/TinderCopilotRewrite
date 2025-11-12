import {
  getThreadIdFromUrl,
  sendMessageToContentScript,
} from "@/background/background";
import { serializeError } from "@/utils/serializeError";
import { generateMessageSolo } from "./generateSolo";
import { generateMessageGroupchat } from "./generateGroupChat";

import {
  matchIntercepts,
  matchListIntercepts,
  profileIntercepts,
  userIntercepts,
  groupConversationsIntercepts,
  fetchIntercepts,
  duoMatchList,
  userProfile,
  groupConversationsList,
  profilesList,
  matchMessagesList,
} from "@/fetchInterception/fetchResponseStorage";
export async function handleRizz() {
  const Id = await getThreadIdFromUrl(true);
  try {
    console.log("fetchIntercepts:", [...fetchIntercepts]);
    console.log("DuoMatchList:", [...duoMatchList]);
    console.log("UserProfile:", userProfile);
    console.log("GroupConversationsList:", [...groupConversationsList]);
    console.log("ProfilesList:", [...profilesList]);
    console.log("matchIntercepts:", [...matchIntercepts]);
    console.log("matchMessagesList:", [...matchMessagesList]);
    if (!Id.includes("-")) {
      // Solo chat handling
      const idShort = await getThreadIdFromUrl(false);
      const data = matchMessagesList.get(Id) || [];
      let msg;
      if (data.length === 0) {
        msg = await generateMessageSolo(idShort);
      } else {
        msg = await generateMessageSolo(idShort, data);
      }
      return { message: msg };
    } else {
      // Group chat handling
      const messages = groupConversationsList.get(Id) || [];
      const [buddyId, match1Id, match2Id] = duoMatchList.get(Id) || [
        "",
        "",
        "",
      ];
      let msg;
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
