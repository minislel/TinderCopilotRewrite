let GEMINI_API_KEY = "SIKE_YOU_WILL_NEVER_GET_THIS";
import { GoogleGenAI } from "@google/genai";
import { Message, Profile } from "@/types";
import {
  evaluatePrompt,
  nextMessageGroupChatPrompt,
  firstMessageGroupChatPrompt,
  nextMessageSoloPrompt,
  firstMessageSoloPrompt,
} from "@/prompts";

let language: string;
let userId: string;

async function getMatchId(full: boolean): Promise<string> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  if (tab.url?.search("tinder.com") === -1) {
    return "";
  } else {
    let url = new URL(tab.url!);
    let pathSegments = url.pathname.split("/");
    console.log("Path Segments:", pathSegments);
    let matchId = null;
    if (pathSegments[3].includes("-")) {
      return pathSegments[3];
    }
    if (full) {
      matchId = pathSegments.slice(3)[0];
    } else {
      matchId = pathSegments.slice(3)[0]?.substring(0, 24);
      if (matchId == userId) {
        matchId = pathSegments.slice(3)[0]?.substring(24, 49);
      }
    }
    return matchId as string;
  }
}
async function sendMessageToContentScript(action: any, data?: any) {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const response = await chrome.tabs.sendMessage(tab.id!, {
    action: action,
    data: data,
  });
  console.log("Response from content script:", response);
  return response;
}
async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages: Array<Message>
): Promise<string>;
async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string
): Promise<string>;
async function generateMessageGroupchat(
  buddyId: string,
  match1Id: string,
  match2Id: string,
  messages?: Array<Message>
): Promise<string> {
  let xauthToken = await getXauthToken();
  let buddyProfile = await getProfileData(buddyId, xauthToken);
  let match1Profile = await getProfileData(match1Id, xauthToken);
  let match2Profile = await getProfileData(match2Id, xauthToken);
  let userProfile = await getProfileData(userId, xauthToken);
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

async function fetchMessagesFromAPIGroupchat(
  groupchatId: string,
  xauthToken: string
): Promise<Array<Message>> {
  const response = await fetch(
    `https://api.gotinder.com/v1/conversations/messages?limit=30&sort_order=desc&conversation_id=${groupchatId}`,
    {
      headers: {
        "X-Auth-Token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    }
  );
  const data = await response.json();
  console.log("Group Chat Messages Data:", data);
  let index = 0;
  let messagesStripped: Array<Message> = data.messages.map(
    (msg: any): Message => {
      return {
        from: msg.user_id,
        content: msg.text,
        index: index++,
      };
    }
  );
  return messagesStripped;
}
async function getXauthToken(): Promise<string> {
  const response = await sendMessageToContentScript("GetXauthToken");
  return response.token as string;
}
async function fetchMessagesFromAPI(
  matchId: string,
  xauthToken: string
): Promise<Array<Message>> {
  const response = await fetch(
    `https://api.gotinder.com/v2/matches/${matchId}/messages?locale=en-GB&count=30`,
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
  let index = 0;
  let messagesStripped: Array<Message> = data.data.messages.map(
    (msg: any): Message => {
      return {
        from: msg.from,
        content: msg.message,
        index: index++,
      };
    }
  );
  return messagesStripped;
}
async function evaluateMessages(data: Array<Message>) {
  console.log("Evaluating messages:", data);

  let systemInstruction = console.log("data to evaluate:", data);

  let evaluationResponse = await getGeminiResponse([...data], evaluatePrompt);

  let result = (evaluationResponse as string).slice(7, -3); //removes ```json in the beginning and ``` at the end

  console.log("Raw Gemini Response:", result);
  return JSON.parse(result as string);
}
async function generateMessageSolo(matchId: string): Promise<string>;
async function generateMessageSolo(
  matchId: string,
  messages: Array<Message>
): Promise<string>;
async function generateMessageSolo(
  matchId: string,
  messages?: Array<Message>
): Promise<string> {
  let xauthToken = await getXauthToken();
  let matchProfile = await getProfileData(matchId, xauthToken);
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

async function getProfileData(
  profileId: string,
  xauthToken: string
): Promise<Profile> {
  try {
    console.log("Fetching profile data for ID:", profileId);
    const response = await fetch(`https://api.gotinder.com/user/${profileId}`, {
      headers: {
        "x-auth-token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    });
    console.log("Profile Response:", response);
    let result = await response.json();
    let prof = result.results;
    let profile: Profile = {
      id: prof._id,
      name: prof.name,
      age: prof.age,
      bio: prof.bio,
      user_interests:
        prof.user_interests?.selected_interests?.map((i: any) => i.name) ?? [],
      jobs: prof.jobs?.[0]?.title ?? "No job listed",
      descriptors:
        prof.selected_descriptors?.map((desc: any) =>
          desc.choice_selections?.[0]
            ? `${desc.name}: ${desc.choice_selections[0].name}`
            : desc.name
        ) ?? [],
      schools: prof.schools?.[0]?.name ?? "No school listed",
    };
    return profile;
  } catch (e) {
    console.error("Error fetching profile data:", e);
  }
  return {
    id: "Unknown",
    name: "Unknown",
    age: 0,
    bio: "No bio available",
    jobs: "No job listed",
    user_interests: [],
    descriptors: [],
    schools: "No school listed",
  };
}

async function getGeminiResponse(data: any, systemInstruction: string) {
  let prompt = {
    contents: [{ role: "user", parts: [{ text: JSON.stringify(data) }] }],
  };
  console.log("Gemini Prompt:", prompt.contents);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const temperature = 0.76 + Math.random() * 0.15;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt.contents,
    config: {
      temperature: temperature,
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
    case "Setup":
      (async () => {
        language = request.language;
        console.log(`language: ${request.language}`);
        userId = request.userId;
        console.log(`userId: ${request.userId}`);
      })();
      break;
    case "Evaluate":
      (async () => {
        let matchId = await getMatchId(true);
        let authToken = await getXauthToken();
        let messages;
        if (!matchId.includes("-")) {
          messages = await fetchMessagesFromAPI(matchId, authToken);
        } else {
          messages = await fetchMessagesFromAPIGroupchat(matchId, authToken);
        }
        let evaluation = await evaluateMessages(messages);
        sendResponse({ evaluation: evaluation });
      })();

      return true;
      break;
    case "Rizz":
      (async () => {
        let Id = await getMatchId(true);
        if (!Id.includes("-")) {
          let idShort = await getMatchId(false);
          let token = await getXauthToken();
          let data = await fetchMessagesFromAPI(Id, token);
          let msg;
          if (data.length == 0) {
            msg = await generateMessageSolo(idShort);
          } else {
            msg = await generateMessageSolo(idShort, data);
          }
          sendResponse({ message: msg });
        } else {
          let xauthToken = await getXauthToken();
          let buddyId = await sendMessageToContentScript(
            "GetUserIdFromQuerySelector",
            `[class*="Z(1)"][class~="Ar(1/1)"][class~="Bdrs(50%)"][class~="D(f)"][class~="Jc(c)"][class~="Ai(c)"][class~="Bgc($c-ds-background-primary)"][class~="W(36px)"][class~="H(36px)"][class~="Pos(r)"][class~="Mstart(-8px)"] > :first-child > :first-child`
          );
          buddyId = buddyId.userId;
          let match1Id = await sendMessageToContentScript(
            "GetUserIdFromQuerySelector",
            `[class*="Z(3)"][class~="Ar(1/1)"][class~="Bdrs(50%)"][class~="D(f)"][class~="Jc(c)"][class~="Ai(c)"][class~="Bgc($c-ds-background-primary)"][class~="W(36px)"][class~="H(36px)"][class~="Pos(r)"] > :first-child > :first-child`
          );
          match1Id = match1Id.userId;
          let match2Id = await sendMessageToContentScript(
            "GetUserIdFromQuerySelector",
            `[class*="Z(2)"][class~="Ar(1/1)"][class~="Bdrs(50%)"][class~="D(f)"][class~="Jc(c)"][class~="Ai(c)"][class~="Bgc($c-ds-background-primary)"][class~="W(36px)"][class~="H(36px)"][class~="Pos(r)"][class~="Mstart(-8px)"] > :first-child > :first-child`
          );
          match2Id = match2Id.userId;
          let messages = await fetchMessagesFromAPIGroupchat(Id, xauthToken);
          let msg;
          if (messages.length == 0) {
            msg = await generateMessageGroupchat(buddyId, match1Id, match2Id);
          } else {
            msg = await generateMessageGroupchat(
              buddyId,
              match1Id,
              match2Id,
              messages
            );
          }
          console.log("Generated Group Chat Message:", msg);
          sendResponse({ message: msg });
          console.log("Group Chat Message Data:", messages);
        }
      })();

      return true;
      break;
    default:
      sendResponse({});
      break;
  }
}
