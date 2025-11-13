let debounceTimeout: NodeJS.Timeout | undefined;
let isSettingCompletion = false;
import { showAICompletionShadow } from "@/content/AICompletion/showAICompletionShadow";
export async function GetAICompletion() {
  const chatInput = document.querySelector("textarea") as HTMLTextAreaElement;
  const debounceDelay = 600;

  let response;
  if (isSettingCompletion) {
    console.log("Ignorowanie zmiany wywołanej przez shadow completion.");
    return;
  }
  if (debounceTimeout !== undefined) {
    clearTimeout(debounceTimeout);
  }
  const oldShadow = document.querySelectorAll(".copilot-completion-shadow");
  if (oldShadow) oldShadow.forEach((shadow) => shadow.remove());

  const currentValue = chatInput.value;
  if (chatInput.value.trim() === "") {
    clearTimeout(debounceTimeout);
    return;
  }
  debounceTimeout = setTimeout(async () => {
    console.log("Sending message for AI completion:", chatInput.value);
    response = await chrome.runtime.sendMessage({
      action: "GetAICompletion",
      message: chatInput.value,
    });
    console.log("Received AI completion:", response);
    if (!response || currentValue !== chatInput.value) {
      return;
    }
    showAICompletionShadow(response);
  }, debounceDelay);
}
