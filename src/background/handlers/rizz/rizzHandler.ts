import {
  sendMessageToContentScript,
  interceptStorage,
  getThreadId,
} from "@/background/background";

import { serializeError } from "@/utils/serializeError";
import { generateMessageSolo } from "./generateSolo";
import { generateMessageGroupchat } from "./generateGroupChat";

export async function handleRizz() {
  const Id = await getThreadId(true);
  console.log("Rizz thread ID:", Id);
  interceptStorage.listAllData();
  try {
    if (!Id.includes("-")) {
      // Solo chat handling
      const idShort = await getThreadId(false);
      console.log("Solo chat IdShort:", idShort);
      const data = interceptStorage.getMessages(Id.trim()) || [];
      let msg;
      if (data.length === 0) {
        msg = await generateMessageSolo(idShort);
      } else {
        msg = await generateMessageSolo(idShort, data);
      }
      return { message: msg };
    } else {
      // Group chat handling
      const messages = interceptStorage.getMessages(Id.trim()) || [];
      const [buddyId, match1Id, match2Id] = interceptStorage.getDuoMatch(
        Id.trim()
      ) || ["", "", ""];
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
