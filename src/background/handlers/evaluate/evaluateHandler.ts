import {
  sendMessageToContentScript,
  interceptStorage,
  getThreadId,
} from "@/background/background";
import { serializeError } from "@/utils/serializeError";

import { evaluateMessages } from "./evaluateMessages";

export async function handleEvaluate() {
  try {
    const matchId = await getThreadId(true);
    const messages = interceptStorage.getMessages(matchId)?.slice(0, 30) || [];
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
