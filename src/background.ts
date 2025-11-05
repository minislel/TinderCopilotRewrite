let GEMINI_API_KEY = "SIKE_YOU_ARE_NOT_GETTING_MY_API_KEY";
import { GoogleGenAI } from "@google/genai";
async function getMatchId(full: boolean): Promise<string> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  if (tab.url?.search("tinder.com") === -1) {
    return "";
  } else {
    let url = new URL(tab.url!);
    let pathSegments = url.pathname.split("/");
    let matchId = null;
    if (full) {
      matchId = pathSegments.slice(3)[0];
    } else {
      matchId = pathSegments.slice(3)[0]?.substring(0, 24);
    }
    return new Promise((resolve) => {
      resolve(matchId as string);
    });
  }
}
async function getXauthToken(): Promise<string> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id!,
      { action: "GetXauthToken" },
      (response) => {
        console.log("Xauth Token:", response.token);
        resolve(response.token as string);
      }
    );
  });
}
async function fetchMessagesFromAPI(matchId: string, xauthToken: string) {
  const response = await fetch(
    `https://api.gotinder.com/v2/matches/${matchId}/messages?locale=en-GB&count=100`,
    {
      headers: {
        "X-Auth-Token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    }
  );
  const data = await response.json();
  console.log("Messages Data:", data);
  return data;
}
async function evaluateMessages(data: any) {
  let messagesStripped = data.data.messages.map((msg: any) => {
    return {
      from: msg.from,
      to: msg.to,
      message: msg.message,
      timestamp: msg.timestamp,
    };
  });
  let systemInstruction = `
        You are a smooth-talking, funny, confident dating app expert — basically a master of rizz and social flow.
        Your job is to rate how flirty, natural, and engaging each message sounds in the context of a dating chat.
        Don’t be stiff or robotic — imagine how real people on Tinder would feel reading it.
        Keep track of who is who based on the "from" and "to" ID fields and consider the full conversation history.
        For each message:
        - Give it a score from 1 to 10 (1 = awkward or boring, 8 = pure charisma).
        - Write a short, casual reason (like “too formal”, “funny and confident”, “try-hard but works”, etc.), just a few words.
        - Always consider the previous messages — context matters.
        
        Keep the output as valid JSON, structured like this:
        [
          { "index": 0, "score": 8, "reason": "playful and confident" },
          { "index": 1, "score": 5, "reason": "a bit dry, needs more personality" }
        ]
        
        Stay consistent, fun, and slightly cheeky in tone. Never overanalyze or moralize — it's all about the *vibe*.
        `;
  console.log("data to evaluate:", data);
  let evaluationResponse = await getGeminiResponse(
    [...messagesStripped],
    systemInstruction
  );

  console.log("Evaluation Response:", evaluationResponse);
  return evaluationResponse;
}

async function getGeminiResponse(data: any, systemInstruction: string) {
  let prompt = { contents: [data] };
  console.log("Gemini Prompt:", prompt.contents);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: JSON.stringify(prompt),
    config: {
      systemInstruction: systemInstruction,
    },
  });

  let result = response.text?.slice(7, -3); //removes ```json in the beginning and ``` at the end
  console.log("Raw Gemini Response:", result);
  return JSON.parse(result as string);
}
chrome.runtime.onMessage.addListener(handleMessages);
async function handleMessages(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  switch (request.action) {
    case "Evaluate":
      let matchId = await getMatchId(true);
      let authToken = await getXauthToken();
      let messages = await fetchMessagesFromAPI(matchId, authToken);
      let evaluation = await evaluateMessages(messages).then((result: any) => {
        sendResponse({ evaluation: result });
      });

      return true;
      break;
    case "Rizz":
      let Id = await getMatchId(true);
      let token = await getXauthToken();
      let data = await fetchMessagesFromAPI(Id, token);
      //getGeminiResponse(data);
      return true;
      break;
    default:
      sendResponse({});
      break;
  }
}
