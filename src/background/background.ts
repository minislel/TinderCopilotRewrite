import { handleEvaluate } from "@/background/handlers/evaluate/evaluateHandler";
import { handleRizz } from "@/background/handlers/rizz/rizzHandler";
import { handleCompletion } from "@/background/handlers/completion/completionHandler";
import { sleep } from "@/utils/sleep";
import { InterceptStorage } from "@/background/fetchInterception/interceptStorage";
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
export async function getThreadId(full: boolean): Promise<string> {
  console.log("getThreadId called with full =", full);
  const result = await sendMessageToContentScript("getThreadId", full);

  console.log("getThreadId result:", result);
  return result;
}
export async function sendMessageToContentScript(
  actionToSend: any,
  dataToSend?: any
) {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  console.log("Sending message to content script:", {
    action: actionToSend,
    data: dataToSend,
  });
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
  //console.log("Background received message:", request);
  switch (request.action) {
    case "Setup":
      (async () => {
        await sleep(1500);
        language = request.language;
        sendResponse({ status: "Setup started" });
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
      sendResponse({ status: "fetch intercepted" });
      break;
    default:
      sendResponse({});
      break;
  }
}
