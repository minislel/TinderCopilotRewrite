import { GetAICompletion } from "@/content/AICompletion/GetAICompletion";
import { getEvaluations } from "./Evaluations/getEvaluations";
import { applyCachedEvaluations } from "./Evaluations/applyEvaluations";

let userId = "";

export function getThreadIdFromUrl(full: boolean): string {
  const url = new URL(window.location.href);
  if (url.hostname !== "tinder.com") {
    return "";
  } else {
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

function placeButtons() {
  const classes =
    "Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($g-ds-background-brand-gradient) button--primary-shadow StyledButton Bxsh($bxsh-btn) Fw($semibold) focus-button-style Mb(16px) As(fe) ";
  const selector = [
    ".Bgc\\(\\$c-ds-background-primary\\)",
    ".Pos\\(r\\)",
    ".D\\(f\\)",
    ".Fx\\(\\$flx1\\)",
    ".Bdstartw\\(0\\)",
    ".Mih\\(72px\\)--ml",
    ".Pend\\(24px\\)--ml",
  ].join("");
  const chatBox = document.querySelector(selector);

  if (!chatBox) {
    console.log("Button placement failed");
    return false;
  }

  const btnEvaluate = document.createElement("span");
  btnEvaluate.textContent = "Evaluate Messages";
  btnEvaluate.classList += classes;
  btnEvaluate.classList += "evaluateButton";
  btnEvaluate.style.marginLeft = "3px";
  btnEvaluate.style.marginRight = "3px";
  btnEvaluate.addEventListener("click", getEvaluations);
  const btnRizz = document.createElement("span");
  btnRizz.classList += classes;
  btnRizz.classList += "rizzButton";
  btnRizz.textContent = "Rizz me";
  btnRizz.addEventListener("click", applyRizz);
  chatBox.appendChild(btnEvaluate);
  chatBox.appendChild(btnRizz);
  return true;
}
async function injectScriptToPage() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("injectHook.js");
  (document.head || document.documentElement).appendChild(script);
  console.log("Injected script to page");
}

function showToast(message: string) {
  const existingToast = document.querySelector("#tinderCopilotToast");
  if (existingToast) existingToast.remove();
  console.log("Showing toast:", message);
  const toast = document.createElement("div");
  toast.id = "tinderCopilotToast";
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.right = "30px";
  toast.style.zIndex = "999999";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "10px";
  toast.style.fontSize = "14px";
  toast.style.fontWeight = "600";
  toast.style.color = "#fff";
  toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25)";
  toast.style.transition = "opacity 0.3s ease";
  toast.style.opacity = "1";
  toast.style.background = "linear-gradient(90deg, #ff4b2b, #ff416c)";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

async function setup() {
  const lang = (document.querySelector("html") as HTMLHtmlElement).lang;
  //await sleep(1500);
  await chrome.runtime.sendMessage({
    action: "Setup",
    language: lang,
  });
  const chatInput = document.querySelector("textarea") as HTMLTextAreaElement;
  chatInput.addEventListener("input", () => {
    console.log("Chat input changed:", chatInput.value);
    GetAICompletion();
  });
}
async function applyRizz(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  const button = document.querySelector(".rizzButton") as HTMLElement;
  if (button) {
    const width = button.offsetWidth;
    button.style.width = `${width}px`;
    button.classList.remove("Bg($g-ds-background-brand-gradient)");
    button.textContent = "Working...";
  }
  let response;
  try {
    response = await chrome.runtime.sendMessage({
      action: "Rizz",
    });
  } catch (error) {
    if (button) {
      button.classList.add("Bg($g-ds-background-brand-gradient)");
      button.textContent = "Rizz me";
      button.style.removeProperty("width");
    }
  }

  console.log("Received rizz message:", response.message);
  const chatInput = document.querySelector("textarea");
  if (chatInput) {
    (chatInput as HTMLTextAreaElement).value = response.message;
    const inputEvent = new Event("input", { bubbles: true });
    chatInput.dispatchEvent(inputEvent);
  }
  if (button) {
    button.classList.add("Bg($g-ds-background-brand-gradient)");
    button.textContent = "Rizz me";
    button.style.removeProperty("width");
  }
}

window.addEventListener("load", () => {
  injectScriptToPage();
  const chatContainer =
    document.querySelector('[aria-label="Conversation history"]') ||
    document.body;

  if (!chatContainer) {
    return;
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        if (!document.querySelector(".rizzButton")) {
          const placed = placeButtons();
          if (placed) {
            console.log("❤️‍🔥Rizz buttons placed!");
            setup();

            applyCachedEvaluations();
          }
        }
        break;
      }
    }
  });

  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });
});
window.addEventListener("message", (event) => {
  if (!event.source || event.source !== window) return;
  const msg = event.data;

  chrome.runtime.sendMessage({
    action: "FETCH_INTERCEPT",
    data: msg.payload,
    endpoint: msg.endpoint,
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.id === chrome.runtime.id && request.action === "Error") {
    showToast(request.data.message);
    if (request.data.function === "Evaluate") {
      const button = document.querySelector(".evaluateButton") as HTMLElement;
      if (button) {
        button.classList.add("Bg($g-ds-background-brand-gradient)");
        button.textContent = "Evaluate Messages";
        button.style.removeProperty("width");
      }
    }
    if (request.data.function === "Rizz") {
      const button = document.querySelector(".rizzButton") as HTMLElement;
      if (button) {
        button.classList.add("Bg($g-ds-background-brand-gradient)");
        button.textContent = "Rizz me";
        button.style.removeProperty("width");
      }
    }
    console.error("Error from background:", request.data.errorMessage);
  } else if (
    sender.id === chrome.runtime.id &&
    request.action === "getThreadId"
  ) {
    const threadId = getThreadIdFromUrl(request.data);
    console.log("Sending threadId to background:", threadId);
    sendResponse(threadId); // Wysyłasz ID
  } else if (
    sender.id === chrome.runtime.id &&
    request.action === "setUserId"
  ) {
    console.log("Setting userId in content script:", request);
    userId = request.data;
    console.log("User ID set to:", userId);
  }
});
