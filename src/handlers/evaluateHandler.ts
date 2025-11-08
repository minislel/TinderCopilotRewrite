import { getXauthToken, evaluateMessages } from "@/background/background";
import { fetchMessagesFromAPI } from "@/tinderAPI";
import { getThreadIdFromUrl } from "@/background/background";

export async function handleEvaluate() {
  const matchId = await getThreadIdFromUrl(true);
  const authToken = await getXauthToken();
  const messages = await fetchMessagesFromAPI(matchId, authToken);
  const evaluation = await evaluateMessages(messages);

  return { evaluations: evaluation, conversationId: matchId };
}
