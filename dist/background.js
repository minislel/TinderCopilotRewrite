/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
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
function getMatchId(full) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let queryOptions = { active: true, currentWindow: true };
        let [tab] = yield chrome.tabs.query(queryOptions);
        console.log(tab);
        if (((_a = tab.url) === null || _a === void 0 ? void 0 : _a.search("tinder.com")) === -1) {
            return "";
        }
        else {
            let url = new URL(tab.url);
            let pathSegments = url.pathname.split("/");
            let matchId = null;
            if (full) {
                matchId = pathSegments.slice(3)[0];
            }
            else {
                matchId = (_b = pathSegments.slice(3)[0]) === null || _b === void 0 ? void 0 : _b.substring(0, 24);
            }
            return new Promise((resolve) => {
                resolve(matchId);
            });
        }
    });
}
function getXauthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let queryOptions = { active: true, currentWindow: true };
        let [tab] = yield chrome.tabs.query(queryOptions);
        console.log(tab);
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, { action: "GetXauthToken" }, (response) => {
                console.log("Xauth Token:", response.token);
                resolve(response.token);
            });
        });
    });
}
function fetchMessagesFromAPI(matchId, xauthToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://api.gotinder.com/v2/matches/${matchId}/messages?locale=en-GB&count=100`, {
            headers: {
                "X-Auth-Token": xauthToken,
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            },
        });
        const data = yield response.json();
        console.log("Messages Data:", data);
        return data;
    });
}
chrome.runtime.onMessage.addListener(handleMessages);
function handleMessages(request, sender, sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (request.action) {
            case "Evaluate":
                getMatchId(true).then((matchId) => {
                    sendResponse({ matchId: matchId });
                });
                return true;
                // removed by dead control flow

            case "Rizz":
                let Id = yield getMatchId(true);
                let token = yield getXauthToken();
                fetchMessagesFromAPI(Id, token);
                return true;
                // removed by dead control flow

            default:
                sendResponse({}); // Send an empty response for unrecognized actions
                break;
        }
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/background.ts"].call(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=background.js.map