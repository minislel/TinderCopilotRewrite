function placeButtons() {
  const classes = `button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($g-ds-background-brand-gradient) button--primary-shadow StyledButton Bxsh($bxsh-btn) Fw($semibold) focus-button-style Mb(16px) As(fe) `;
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
    console.log("nie udalo sie postawic buttona");
    return false;
  }

  const btnEvaluate = document.createElement("span");
  btnEvaluate.textContent = "Evaluate Messages";
  btnEvaluate.classList += classes;
  btnEvaluate.classList += "evaluateButton";
  btnEvaluate.style.marginLeft = "3px";
  btnEvaluate.style.marginRight = "3px";
  btnEvaluate.onclick = async () => {
    await applyEvaluations();
  };
  const btnRizz = document.createElement("span");
  btnRizz.classList += classes;
  btnRizz.classList += "rizzButton";
  btnRizz.textContent = "Rizz me";
  btnRizz.onclick = async () => {
    await applyRizz();
  };
  chatBox.appendChild(btnEvaluate);
  chatBox.appendChild(btnRizz);
  return true;
}
async function applyRizz() {
  let response = await chrome.runtime.sendMessage({ action: "Rizz" });
  console.log("Received matchId:", response.matchId);
}
async function applyEvaluations() {
  let response = await chrome.runtime.sendMessage({ action: "Evaluate" });
  console.log("Received evaluation results:", response);
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
    console.log(apiToken); // Wyświetla token w konsoli
    console.log(request.payload); // "Elo, co tam na froncie? Podpisano, B."

    // (Opcjonalnie) Odsyłamy odpowiedź
    sendResponse({
      token: apiToken,
    });
  }

  return true;
});
