let GEMINI_API_KEY = "AIzaSyBrDUgN31pNudp_WNpY423j6x8J0kt6-do";
import { GoogleGenAI } from "@google/genai";
import { Evaluation, Message, Profile } from "@/types";
import {
  evaluatePrompt,
  nextMessageGroupChatPrompt,
  firstMessageGroupChatPrompt,
  nextMessageSoloPrompt,
  firstMessageSoloPrompt,
} from "@/prompts";
import { fetchProfileData, fetchUserId } from "@/tinderAPI";
import { handleEvaluate } from "@/handlers/evaluateHandler";
import { handleRizz } from "@/handlers/rizzHandler";
let language: string;
let userId: string;
export let xauthToken: string;

export async function getThreadIdFromUrl(full: boolean): Promise<string> {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  if (tab.url?.search("tinder.com") === -1) {
    return "";
  } else {
    const url = new URL(tab.url as string);
    const pathSegments = url.pathname.split("/");
    let matchId = null;
    if (pathSegments[3].includes("-")) {
      return pathSegments[3];
    }
    if (full) {
      matchId = pathSegments.slice(3)[0];
    } else {
      matchId = pathSegments.slice(3)[0]?.substring(0, 24);
      if (matchId === userId) {
        matchId = pathSegments.slice(3)[0]?.substring(24, 49);
      }
    }
    return matchId as string;
  }
}
export async function sendMessageToContentScript(action: any, data?: any) {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  const response = await chrome.tabs.sendMessage(tab.id!, {
    action: action,
    data: data,
  });
  return response;
}
export async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages: Array<Message>
): Promise<string>;
export async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string
): Promise<string>;
export async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages?: Array<Message>
): Promise<string> {
  const buddyProfile = await fetchProfileData(buddyId, xauthToken);
  const match1Profile = await fetchProfileData(match1Id, xauthToken);
  const match2Profile = await fetchProfileData(match2Id, xauthToken);
  const userProfile = await fetchProfileData(userId, xauthToken);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getGeminiResponse(
      [...messages],
      nextMessageGroupChatPrompt(
        buddyProfile,
        match1Profile,
        match2Profile,
        userProfile
      )
    );
  } else {
    messageResponse = await getGeminiResponse(
      [],
      firstMessageGroupChatPrompt(
        language,
        buddyProfile,
        match1Profile,
        match2Profile,
        userProfile
      )
    );
  }

  return messageResponse as string;
}

export async function getXauthToken(): Promise<string> {
  const response = await sendMessageToContentScript("GetXauthToken");
  return response.token as string;
}
export async function evaluateMessages(data: Array<Message>) {
  if (data.length === 0) {
    return [];
  }
  const evaluationResponse = await getGeminiResponse([...data], evaluatePrompt);

  const result = (evaluationResponse as string).slice(7, -3); //removes ```json in the beginning and ``` at the end

  console.log("Raw Gemini Response:", result);
  const evaluations: Array<Evaluation> = JSON.parse(result as string).map(
    (evalItem: any): Evaluation => {
      return {
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
export async function generateMessageSolo(matchId: string): Promise<string>;
export async function generateMessageSolo(
  matchId: string,
  messages: Array<Message>
): Promise<string>;
export async function generateMessageSolo(
  matchId: string,
  messages?: Array<Message>
): Promise<string> {
  let xauthToken = await getXauthToken();
  let matchProfile = await fetchProfileData(matchId, xauthToken);
  let messageResponse;
  if (messages && messages.length > 0) {
    messageResponse = await getGeminiResponse(
      [...messages],
      nextMessageSoloPrompt(userId, matchProfile) as string
    );
  } else {
    messageResponse = await getGeminiResponse(
      [],
      firstMessageSoloPrompt(language, matchProfile)
    );
  }
  return messageResponse as string;
}

async function getGeminiResponse(data: any, systemPrompt: string) {
  const prompt = {
    contents: [{ role: "user", parts: [{ text: JSON.stringify(data) }] }],
  };
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const temp = 0.76 + Math.random() * 0.15;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt.contents,
    config: {
      temperature: temp,
      thinkingConfig: {
        thinkingBudget: 3,
      },
      systemInstruction: systemPrompt,
    },
  });

  return response.text;
}
export async function getGroupConversationPartners(
  matchList: any,
  matchId: string
): Promise<Array<string>> {
  let FoundMatch;
  let userIds: Array<string> = [];
  for (let match of matchList) {
    if (match._id === matchId) {
      FoundMatch = match;
      break;
    }
  }
  if (FoundMatch) {
    userIds[0] = FoundMatch.duo.partners[0];
    userIds[1] = FoundMatch.other_group_participants.filter(
      (id: string) => id !== undefined && id !== userIds[0]
    )[0]._id;
    userIds[2] = FoundMatch.other_group_participants.filter(
      (id: string) => id !== undefined && id !== userIds[0] && id !== userIds[1]
    )[0]._id;
  }
  return userIds;
}
async function injectScriptToPage() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ["injectHook.js"],
    world: "MAIN",
  });
}
chrome.runtime.onMessage.addListener(handleMessages);
function handleMessages(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  switch (request.action) {
    case "Setup":
      (async () => {
        language = request.language;
        xauthToken = await getXauthToken();
        userId = await fetchUserId(xauthToken);
        //injectScriptToPage();
      })();
      return;
    case "Evaluate":
      handleEvaluate().then((result) => {
        sendResponse(result);
      });
      return true;
    case "Rizz":
      handleRizz().then((result) => {
        sendResponse(result);
      });
      return true;
    default:
      sendResponse({});
      return;
  }
}
