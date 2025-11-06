/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content.ts":
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
/***/ (function() {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        console.log("nie udalo sie postawic buttona");
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
function applyRizz(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.stopPropagation();
        event.preventDefault();
        let response = yield chrome.runtime.sendMessage({ action: "Rizz" });
        console.log("Received rizz message:", response.message);
        const chatInput = document.querySelector("textarea");
        if (chatInput) {
            chatInput.value = response.message;
            const inputEvent = new Event("input", { bubbles: true });
            chatInput.dispatchEvent(inputEvent);
        }
    });
}
function applyEvaluations(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.stopPropagation();
        event.preventDefault();
        let response = yield chrome.runtime.sendMessage({ action: "Evaluate" });
        console.log("Received evaluation results:", response.evaluation);
        const allMsgBoxes = Array.from(document.querySelectorAll(".msg"));
        allMsgBoxes.reverse();
        response.evaluation.forEach((evalItem) => {
            let msgBox = allMsgBoxes[evalItem.index];
            if (msgBox) {
                let badge = document.createElement("img");
                let badgeText = document.createElement("img");
                //badge.textContent = `⭐${evalItem.score} (${evalItem.reason})`;
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
                }
                else {
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
                badge.alt = evalItem.reason;
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
                msgBox.parentElement.appendChild(badge);
            }
        });
    });
}
window.addEventListener("load", () => {
    const chatContainer = document.querySelector('[aria-label="Conversation history"]') ||
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
        console.log(apiToken);
        console.log(request.payload);
        sendResponse({
            token: apiToken,
        });
    }
    return true;
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/content.ts"].call(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=content.js.map