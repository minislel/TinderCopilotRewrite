import {
  getXauthToken,
  sendMessageToContentScript,
} from "@/background/background";
import { serializeError } from "@/utils/serializeError";

import { getThreadIdFromUrl } from "@/background/background";
import { evaluateMessages } from "./evaluateMessages";
import {
  matchMessagesList,
  groupConversationsList,
} from "@/fetchInterception/fetchResponseStorage";

export async function handleEvaluate() {
  try {
    const matchId = await getThreadIdFromUrl(true);
    const messages =
      matchMessagesList.get(matchId)?.slice(0, 30) ||
      groupConversationsList.get(matchId)?.slice(0, 30) ||
      [];
    const evaluation = await evaluateMessages(messages);

    return { evaluations: evaluation, conversationId: matchId };
  } catch (error: any) {
    console.error("Error in handleEvaluate:", error);
    sendMessageToContentScript("Error", {
      message: `Failed to generate evaluation. Error in function ${error.function}. Please try again, or see console for details.`,
      function: "Evaluate",
      errorMessage: serializeError(error),
    });
  }
}
