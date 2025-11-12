import { handleEvaluate } from "@/handlers/evaluate/evaluateHandler";
import { handleRizz } from "@/handlers/rizz/rizzHandler";
import { handleCompletion } from "@/handlers/completion/completionHandler";
import { sleep } from "@/utils/sleep";
import { InterceptStorage } from "@/fetchInterception/interceptStorage";
export let language: string;
export const interceptStorage = new InterceptStorage();

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
      if (matchId === interceptStorage.userProfile.id) {
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
        // injectScriptToPage();
      })();
      break;
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
    case "GetAICompletion":
      handleCompletion(request.message).then((result) => {
        sendResponse(result);
      });
      return true;
    case "FETCH_INTERCEPT":
      interceptStorage.handleIntercept(request.endpoint, request.data);
      break;
    default:
      sendResponse({});
      break;
  }
}
