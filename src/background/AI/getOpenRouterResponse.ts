import { OpenAI } from "openai";
import { OpenRouterModel } from "./openrouterModelEnum";
export async function getOpenRouterResponse(
  data: any,
  systemPrompt: string,
  apiKey: string,
  model: OpenRouterModel
) {
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(data) },
  ];
  const response = await openai.chat.completions.create({
    model: model.toString(),
    messages: messages,
  });
  console.log("OpenRouter Response:", response);
  const responseData = await response.choices[0].message?.content;
  return responseData;
}
