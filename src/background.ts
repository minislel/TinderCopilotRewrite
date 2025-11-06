let GEMINI_API_KEY = "SIKE_YOU_CAN'T_GET_IT_FROM_HERE";
import { GoogleGenAI } from "@google/genai";
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
    let matchId = null;
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
async function nextMessage(messageData: any, matchId: string) {
  let messagesStripped = messageData.data.messages.map((msg: any) => {
    return {
      from: msg.from,
      to: msg.to,
      message: msg.message,
      timestamp: msg.timestamp,
    };
  });

  let systemInstruction = `
    You are a confident, funny, smooth-talking dating app pro — a natural flirt who knows how to keep a Tinder convo alive and vibey.
    Your job: write the *next message* the user (id: ${userId}) should send in the current Tinder chat.

    Guidelines:
    - Match the tone, humor, and energy of the previous messages — if it’s playful, flirt back; if it’s chill, keep it chill.
    - Always sound like a real human texting, not like a chatbot or therapist.
    - Use casual, natural language. Shorter is usually better. Emojis are okay if they fit the tone.
    - Keep it confident, witty, and slightly teasing — never desperate or cringey.
    - Respond based on full chat context and who said what (track "from" and "to" IDs).
    - Don’t explain, analyze, or add commentary. Just return **one** message ready to send.
    - Focus on vibe, flow, and connection — not logic or overthinking.

    Remember: you’re not writing *for* an AI. You’re helping a real person flirt better. Be smooth, be funny, be *rizz*.
    `;

  console.log("data to evaluate:", messagesStripped);
  let nextMessageResponse = await getGeminiResponse(
    [...messagesStripped],
    systemInstruction
  );

  return nextMessageResponse;
}
async function getProfileData(profileId: string, xauthToken: string) {
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
    return response.json();
  } catch (e) {
    console.error("Error fetching profile data:", e);
  }
}
async function firstMessage(profileData: any, matchId: string) {
  console.log("Generating first message for match ID:", profileData.results);
  let prof = profileData.results;
  let profile = {
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

  console.log("data to evaluate:", profile);
  let systemInstruction = `
        You are a smooth-talking, funny, confident dating app expert — basically a master of rizz and social flow.
        Your job is to Provide the best opening message to send to this person on Tinder based on their profile.
        Try to keep your response relatively short, 2-3 sentences AT MOST.
        Provide the message in this language: ${language}.
        If there is a popular short version of the name of the conversation partner, try to use it (for example in Polish - Aleksandra - Ola).
        If there is bio provided, try to mimic its general vibe and aesthetic.
        You may use the provided profile data fully, partially, or not at all, it's up to you to decide.
        If there is no bio provided, try not to reference profile details other than name too much, it's still allowed but slightly discouraged.
        Don’t be stiff or robotic — imagine how real people on Tinder would feel reading it.
        Provide one message only, no explanations, comments, or your own thoughts or assumptions, the message should be ready to send to the conversation partner.
        Stay consistent, fun, and slightly cheeky in tone. Never overanalyze or moralize — it's all about the *vibe*.
        `;
  console.log("data to evaluate:", profileData);
  console.log(systemInstruction);
  let firstMessageResponse = await getGeminiResponse(
    [profile],
    systemInstruction
  );
  return firstMessageResponse;
}
async function getGeminiResponse(data: any, systemInstruction: string) {
  let prompt = { contents: [{ role: "user", content: JSON.stringify(data) }] };
  console.log("Gemini Prompt:", prompt.contents);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const temperature = 0.8 + Math.random() * 0.3;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: JSON.stringify(prompt),
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
        let messages = await fetchMessagesFromAPI(matchId, authToken);
        let evaluation = await evaluateMessages(messages);
        sendResponse({ evaluation: evaluation });
      })();

      return true;
      break;
    case "Rizz":
      (async () => {
        let Id = await getMatchId(true);
        let idShort = await getMatchId(false);
        let token = await getXauthToken();
        let profileData = await getProfileData(idShort, token);
        console.log("Profile Data:", profileData);
        let data = await fetchMessagesFromAPI(Id, token);
        let msg;
        if (data.data.messages.length == 0) {
          msg = await firstMessage(profileData, Id);
        } else {
          msg = await nextMessage(data, Id);
        }
        sendResponse({ message: msg });
      })();

      //getGeminiResponse(data);
      return true;
      break;
    default:
      sendResponse({});
      break;
  }
}
