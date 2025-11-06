let GEMINI_API_KEY = "SIKE_YOU_WONT_GET_MY_KEY";
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
    return matchId as string;
  }
}
async function getXauthToken(): Promise<string> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  const response = await chrome.tabs.sendMessage(tab.id!, {
    action: "GetXauthToken",
  });
  return response.token as string;
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
        - Give it a score from 1 to 8 (1 = awkward or boring, 8 = pure charisma).
        - Write a short, casual reason (like “too formal”, “funny and confident”, “try-hard but works”, etc.), just a few words.
        - Always consider the previous messages — context matters.
        
        Keep the output as valid JSON, structured like this:
        [
          { "index": 0, "score": 8, "reason": "playful and confident" },
          { "index": 1, "score": 5, "reason": "a bit dry, needs more personality" }
        ]
        index 0 refers to the most recent message, index 1 to the one before that, and so on.
        Stay consistent, fun, and slightly cheeky in tone. Never overanalyze or moralize — it's all about the *vibe*.
        `;
  console.log("data to evaluate:", data);
  let evaluationResponse = await getGeminiResponse(
    [...messagesStripped],
    systemInstruction
  );

  let result = (evaluationResponse as string).slice(7, -3); //removes ```json in the beginning and ``` at the end

  console.log("Raw Gemini Response:", result);
  return JSON.parse(result as string);
}
async function nextMessage(data: any, matchId: string) {
  let messagesStripped = data.data.messages.map((msg: any) => {
    return {
      from: msg.from,
      to: msg.to,
      message: msg.message,
      timestamp: msg.timestamp,
    };
  });
  let userId = messagesStripped[0].from.includes(matchId)
    ? messagesStripped[0].to
    : messagesStripped[0].from;
  let systemInstruction = `
        You are a smooth-talking, funny, confident dating app expert — basically a master of rizz and social flow.
        Your job is to Provide the next best message to send in this dating chat, matching the language of the previous messages.
        You are the user with id equal to ${userId}.
        Don’t be stiff or robotic — imagine how real people on Tinder would feel reading it.
        Keep track of who is who based on the "from" and "to" ID fields and consider the full conversation history.
        Provide one message only, no explanations, or your own thoughts or assumptions, the message should be ready to send to the conversation partner.
        Stay consistent, fun, and slightly cheeky in tone. Never overanalyze or moralize — it's all about the *vibe*.
        `;
  console.log("data to evaluate:", data);
  let nextMessageResponse = await getGeminiResponse(
    [...messagesStripped],
    systemInstruction
  );

  return nextMessageResponse;
}

async function getGeminiResponse(data: any, systemInstruction: string) {
  let prompt = { contents: [{ role: "user", content: JSON.stringify(data) }] };
  console.log("Gemini Prompt:", prompt.contents);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: JSON.stringify(prompt),
    config: {
      thinkingConfig: {
        thinkingBudget: 3,
      },
      systemInstruction: systemInstruction,
    },
  });

  return response.text;
}
chrome.runtime.onMessage.addListener(handleMessages);
function handleMessages(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  switch (request.action) {
    case "Evaluate":
      (async () => {
        let matchId = await getMatchId(true);
        let authToken = await getXauthToken();
        let messages = await fetchMessagesFromAPI(matchId, authToken);
        let evaluation = await evaluateMessages(messages);
        sendResponse({ evaluation: evaluation });
      })();

      return true;
      break;
    case "Rizz":
      (async () => {
        let Id = await getMatchId(true);
        let token = await getXauthToken();
        let data = await fetchMessagesFromAPI(Id, token);
        let nextMsg = await nextMessage(data, Id);
        sendResponse({ message: nextMsg });
      })();

      //getGeminiResponse(data);
      return true;
      break;
    default:
      sendResponse({});
      break;
  }
}
