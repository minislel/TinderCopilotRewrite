import { fetchUserId } from "@/tinderAPI";
import { handleEvaluate } from "@/handlers/evaluate/evaluateHandler";
import { handleRizz } from "@/handlers/rizz/rizzHandler";
import { sleep } from "@/utils/sleep";
export let language: string;
export let userId: string;
export let xauthToken: string;
export const fetchIntercepts: { endpoint: string; data: unknown }[] = [];
export const profileIntercepts: { endpoint: string; data: unknown }[] = [];
export const userIntercepts: { endpoint: string; data: unknown }[] = [];
export const groupConversationsIntercepts: {
  endpoint: string;
  data: unknown;
}[] = [];
export const matchIntercepts: { endpoint: string; data: unknown }[] = [];
export const matchesIntercepts: { endpoint: string; data: unknown }[] = [];
async function categorizeIntercept(endpoint: string, data: unknown) {
  if (endpoint.includes("/profile")) {
    profileIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/user")) {
    userIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/conversations")) {
    groupConversationsIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/match")) {
    matchIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/matches")) {
    matchesIntercepts.push({ endpoint, data });
  }
}
// async function injectScriptToPage() {
//   const queryOptions = { active: true };
//   const [tab] = await chrome.tabs.query(queryOptions);
//   await chrome.scripting.executeScript({
//     target: { tabId: tab.id as number },
//     files: ["injectHook.js"],
//     world: "MAIN",
//   });
// }
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
export async function sendMessageToContentScript(
  actionToSend: any,
  dataToSend?: any
) {
  const queryOptions = { active: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  const response = await chrome.tabs.sendMessage(tab.id! as number, {
    action: actionToSend,
    data: dataToSend,
  });
  return response;
}
export async function getXauthToken(): Promise<string> {
  const response = await sendMessageToContentScript("GetXauthToken");
  return response.token as string;
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
        await sleep(1500);
        language = request.language;
        xauthToken = await getXauthToken();
        userId = await fetchUserId(xauthToken);
        // injectScriptToPage();
      })();
      break;
    case "Evaluate":
      console.log("profileIntercepts in Evaluate handler:", profileIntercepts);
      handleEvaluate().then((result) => {
        sendResponse(result);
      });
      return true;
    case "Rizz":
      handleRizz().then((result) => {
        sendResponse(result);
      });
      return true;
    case "FETCH_INTERCEPT":
      fetchIntercepts.push({ endpoint: request.endpoint, data: request.data });
      categorizeIntercept(request.endpoint, request.data);
      break;
    default:
      sendResponse({});
      break;
  }
}
