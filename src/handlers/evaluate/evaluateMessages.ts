import { Message, Evaluation } from "@/types";
import { getAIResponse } from "@/AI/getAIResponse";
import { evaluatePrompt } from "@/AI/prompts";
import { extractJsonString } from "./extractJsonFromAiResponse";
export async function evaluateMessages(data: Array<Message>) {
  if (data.length === 0) {
    return [];
  }

  const evaluationResponse = await getAIResponse([...data], evaluatePrompt);

  const result = extractJsonString(evaluationResponse as string);

  console.log("Raw AI Response:", result);
  const evaluations: Array<Evaluation> = JSON.parse(result as string).map(
    (evalItem: any): Evaluation => {
      return {
        sentDate: data[evalItem.index].sentDate,
        index: evalItem.index,
        score: evalItem.score,
        reason: evalItem.reason,
        content: data[evalItem.index].content,
      };
    }
  );
  console.log("Parsed Evaluations:", evaluations);

  return evaluations;
}
