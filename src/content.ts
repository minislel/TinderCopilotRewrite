import { Language } from "@google/genai";

function placeButtons() {
  const classes = `Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($g-ds-background-brand-gradient) button--primary-shadow StyledButton Bxsh($bxsh-btn) Fw($semibold) focus-button-style Mb(16px) As(fe) `;
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
  btnEvaluate.addEventListener("click", applyEvaluations);
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
  let userId;
  let profilePhoto;
  while (!userId) {
    await sleep(200);
    profilePhoto = document.querySelector(
      '[class~="D(b)"][class~="Pos(r)"][class~="Expand"][class~="Bdrs(50%)"]'
    ) as HTMLElement;
    if (profilePhoto) {
      const bgUrl = profilePhoto?.style.backgroundImage;
      const match = bgUrl?.match(/gotinder\.com\/([a-f0-9]+)\//);
      userId = match ? match[1] : null;
      console.log("UserID:", userId);
    }
  }

  let lang = (document.querySelector("html") as HTMLHtmlElement).lang;
  console.log(lang);
  await chrome.runtime.sendMessage({
    action: "Setup",
    language: lang,
    userId: userId,
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
async function applyEvaluations(event: MouseEvent) {
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
  console.log("Received evaluation results:", response.evaluation);
  const allMsgBoxes = Array.from(document.querySelectorAll(".msg"));
  allMsgBoxes.reverse();
  response.evaluation.forEach((evalItem: any) => {
    let msgBox = allMsgBoxes[evalItem.index] as HTMLElement;
    if (msgBox) {
      let badge = document.createElement("img");
      let badgeText = document.createElement("img");
      if (msgBox.classList.contains("msg--received")) {
        Object.assign(badge.style, {
          position: "absolute",
          top: "0",
          left: "100%",
          transform: "translate(-60%, -60%)",
          zIndex: "2",
          backgroundColor: "#e53935",
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",
          display: "inline-block",
        });
      } else {
        Object.assign(badge.style, {
          position: "absolute",
          top: "0",
          right: "100%",

          transform: "translate(35%, -60%)",

          zIndex: "2",

          backgroundColor: "red",
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",

          display: "inline-block",
        });
      }
      badge.title = evalItem.reason;
      switch (evalItem.score) {
        case 1:
          badge.src = chrome.runtime.getURL("assessments/blunder.png");
          break;
        case 2:
          badge.src = chrome.runtime.getURL("assessments/mistake.png");
          badge.style.backgroundColor = "orange";
          break;
        case 3:
          badge.src = chrome.runtime.getURL("assessments/innacuracy.png");
          badge.style.backgroundColor = "yellow";
          break;
        case 4:
          badge.src = chrome.runtime.getURL("assessments/book.png");
          badge.style.backgroundColor = "brown";
          break;
        case 5:
          badge.src = chrome.runtime.getURL("assessments/good.png");
          badge.style.backgroundColor = "#8AB382";
          break;
        case 6:
          badge.src = chrome.runtime.getURL("assessments/best.png");
          badge.style.backgroundColor = "#61ff31ff";
          break;
        case 7:
          badge.src = chrome.runtime.getURL("assessments/excellent.png");
          badge.style.backgroundColor = "#61ff31ff";
          break;
        case 8:
          badge.src = chrome.runtime.getURL("assessments/brilliant.png");
          badge.style.backgroundColor = "teal";
          break;
        default:
          badgeText.textContent = "❓";
          break;
      }
      badge.appendChild(badgeText);
      (msgBox.parentElement as HTMLElement).appendChild(badge);
    }
  });
  if (button) {
    button.classList.add("Bg($g-ds-background-brand-gradient)");
    button.textContent = "Evaluate Messages";
    button.style.removeProperty("width");
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
