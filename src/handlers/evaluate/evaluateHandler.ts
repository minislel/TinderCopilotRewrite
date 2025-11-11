import {
  getXauthToken,
  sendMessageToContentScript,
} from "@/background/background";
import { serializeError } from "@/utils/serializeError";
import { fetchMessagesFromAPI } from "@/tinderAPI";
import { getThreadIdFromUrl } from "@/background/background";
import { evaluateMessages } from "./evaluateMessages";

export async function handleEvaluate() {
  try {
    const matchId = await getThreadIdFromUrl(true);
    const authToken = await getXauthToken();
    const messages = await fetchMessagesFromAPI(matchId, authToken);
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
