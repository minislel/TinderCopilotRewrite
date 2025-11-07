import { getXauthToken, evaluateMessages } from "@/background/background";
import { fetchMessagesFromAPI } from "@/tinderAPI";
import { getThreadIdFromUrl } from "@/background/background";

export async function handleEvaluate() {
  let matchId = await getThreadIdFromUrl(true);
  let authToken = await getXauthToken();
  let messages = await fetchMessagesFromAPI(matchId, authToken);
  let evaluation = await evaluateMessages(messages);

  return { evaluations: evaluation, conversationId: matchId };
}
