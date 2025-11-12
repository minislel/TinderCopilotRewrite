import { Evaluation } from "./types";
import { sleep } from "./utils/sleep";

let evalCache: Record<string, Array<Evaluation>> = {};
let debounceTimeout: NodeJS.Timeout | undefined;
let isSettingCompletion = false;
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

// Zrób to raz na początku:
// injectShadowCompletionStyles();

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
    debounceAndGetAICompletion();
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
async function debounceAndGetAICompletion() {
  const chatInput = document.querySelector("textarea") as HTMLTextAreaElement;
  const debounceDelay = 400; // milliseconds

  let response;
  if (isSettingCompletion) {
    console.log("Ignorowanie zmiany wywołanej przez shadow completion.");
    return; // Nie ruszaj debounce'a!
  }
  chatInput.removeAttribute("data-shadow-completion");
  chatInput.style.color = "";
  if (debounceTimeout !== undefined) {
    clearTimeout(debounceTimeout);
  }
  const oldShadow = document.querySelectorAll(".copilot-completion-shadow");
  if (oldShadow) oldShadow.forEach((shadow) => shadow.remove());
  const currentValue = chatInput.value;
  if (chatInput.value.trim() === "") {
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
function showAICompletionShadow(completion: string) {
  const chatInput = document.querySelector("textarea") as HTMLTextAreaElement;
  if (!chatInput) return;
  console.log("Showing AI completion shadow:", completion);
  const parent = chatInput.parentElement;
  if (!parent) return;

  // usuwamy starego ducha
  const oldShadow = document.querySelectorAll(".copilot-completion-shadow");
  if (oldShadow) oldShadow.forEach((shadow) => shadow.remove());

  const style = getComputedStyle(chatInput);

  const shadow = document.createElement("div");
  shadow.className = "copilot-completion-shadow";
  shadow.style.position = "absolute";
  shadow.style.top = chatInput.offsetTop + "px";
  shadow.style.left = chatInput.offsetLeft + "px";
  shadow.style.width = chatInput.offsetWidth + "px";
  shadow.style.height = chatInput.offsetHeight + "px";
  shadow.style.overflow = "hidden";
  shadow.style.pointerEvents = "none";
  shadow.style.whiteSpace = "pre-wrap";
  shadow.style.font = style.font;
  shadow.style.padding = style.padding;
  shadow.style.lineHeight = style.lineHeight;
  shadow.style.color = "rgba(255,255,255,0.25)";
  shadow.style.zIndex = (parseInt(style.zIndex) || 1) + 1 + "";
  shadow.style.fontStyle = "italic";

  const userText = chatInput.value;
  shadow.innerHTML =
    `<span style="opacity:0">${userText}</span>` +
    `<span style="opacity:0.75">${completion.slice(userText.length)}</span>`;
  parent.insertBefore(shadow, chatInput);
}

async function getEvaluations(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  const button = document.querySelector(".evaluateButton") as HTMLElement;
  if (button) {
    const width = button.offsetWidth;
    button.style.width = `${width}px`;
    button.classList.remove("Bg($g-ds-background-brand-gradient)");
    button.textContent = "Working...";
  }

  const response = await chrome.runtime.sendMessage({
    action: "Evaluate",
  });

  await applyEvaluations(response.evaluations);
  evalCache[response.conversationId] = response.evaluations;
  if (button) {
    button.classList.add("Bg($g-ds-background-brand-gradient)");
    button.textContent = "Evaluate Messages";
    button.style.removeProperty("width");
  }
}
async function getThreadIdFromUrl() {
  const url = new URL(window.location.href);
  if (url.hostname !== "tinder.com") {
    return "";
  } else {
    const pathSegments = url.pathname.split("/");
    return pathSegments[3];
  }
}

async function applyEvaluations(evals: Array<Evaluation>) {
  console.log("Received evaluation results:", evals);
  const allMsgBoxes = Array.from(
    document.querySelectorAll(".msg")
  ) as HTMLElement[];
  const msgMap = new Map<string, HTMLElement>();
  allMsgBoxes.forEach((msgBox) => {
    const timeEl = msgBox.parentElement?.querySelector(
      "time[datetime]"
    ) as HTMLElement | null;
    if (timeEl) {
      const datetime = timeEl.getAttribute("datetime");
      if (datetime) {
        msgMap.set(datetime, msgBox);
      }
    }
  });
  console.log("Message map:", msgMap);
  console.log("allMsgBoxes:", allMsgBoxes);
  evals.forEach((evalItem: any) => {
    //let msgBox: HTMLElement = document.createElement("img");
    const msgBox = msgMap.get(evalItem.sentDate);
    console.log("Evaluating message box for date:", evalItem, msgBox);
    if (msgBox) {
      const badge = document.createElement("img");

      Object.assign(badge.style, {
        position: "absolute",
        top: "0",
        zIndex: "2",
        backgroundColor: "red",
        width: "3rem",
        height: "3rem",
        borderRadius: "50%",
        display: "inline-block",
      });
      if (msgBox.classList.contains("msg--received")) {
        Object.assign(badge.style, {
          left: "100%",
          transform: "translate(-60%, -60%)",
        });
      } else {
        Object.assign(badge.style, {
          right: "100%",
          transform: "translate(35%, -60%)",
        });
      }

      badge.title = evalItem.reason;
      switch (evalItem.score) {
        case 1:
          badge.src = chrome.runtime.getURL("assessments/blunder.png");
          break;
        case 2:
          badge.src = chrome.runtime.getURL("assessments/mistake.png");
          break;
        case 3:
          badge.src = chrome.runtime.getURL("assessments/innacuracy.png");
          break;
        case 4:
          badge.src = chrome.runtime.getURL("assessments/book.png");
          break;
        case 5:
          badge.src = chrome.runtime.getURL("assessments/good.png");
          break;
        case 6:
          badge.src = chrome.runtime.getURL("assessments/best.png");
          break;
        case 7:
          badge.src = chrome.runtime.getURL("assessments/excellent.png");
          break;
        case 8:
          badge.src = chrome.runtime.getURL("assessments/brilliant.png");
          break;
        default:
          break;
      }
      (msgBox.parentElement as HTMLElement).appendChild(badge);
    }
  });
}
async function applyCachedEvaluations() {
  const threadId = await getThreadIdFromUrl();

  const cachedEvals = evalCache[threadId];
  if (cachedEvals) {
    await applyEvaluations(cachedEvals);
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
  if (sender.id === chrome.runtime.id && request.action === "GetXauthToken") {
    const apiToken = localStorage.getItem("TinderWeb/APIToken");
    console.log(apiToken);
    sendResponse({
      token: apiToken,
    });
  } else if (sender.id === chrome.runtime.id && request.action === "Error") {
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
  }
  return true;
});
