import { Evaluation } from "./types";

let evalCache: Record<string, Array<Evaluation>> = {};
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
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setup() {
  const lang = (document.querySelector("html") as HTMLHtmlElement).lang;
  await chrome.runtime.sendMessage({
    action: "Setup",
    language: lang,
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
  let response = await chrome.runtime.sendMessage({
    action: "Rizz",
  });
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
async function applyEvaluations(evals: Array<Evaluation>) {
  console.log("Received evaluation results:", evals);
  const allMsgBoxes = Array.from(document.querySelectorAll(".msg"));
  allMsgBoxes.reverse();
  evals.forEach((evalItem: any) => {
    let msgBox = allMsgBoxes[evalItem.index] as HTMLElement;
    if (msgBox) {
      let badge = document.createElement("img");

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
  let response = await chrome.runtime.sendMessage({
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
async function applyCachedEvaluations() {
  const threadId = await getThreadIdFromUrl();

  const cachedEvals = evalCache[threadId];
  if (cachedEvals) {
    await applyEvaluations(cachedEvals);
  }
}
window.addEventListener("load", () => {
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
          let placed = placeButtons();
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
  if (!msg || !msg.__RIZZ_FROM_PAGE) return;

  chrome.runtime.sendMessage({
    action: "FETCH_INTERCEPT",
    data: msg.payload,
  });
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.id === chrome.runtime.id && request.action === "GetXauthToken") {
    const apiToken = localStorage.getItem("TinderWeb/APIToken");
    console.log("Przyszła wiadomość z backgroundu!");
    console.log(apiToken);
    console.log(request.payload);

    sendResponse({
      token: apiToken,
    });
  }

  return true;
});
