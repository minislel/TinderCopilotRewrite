async function getMatchId(full: boolean): Promise<string> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  if (tab.url?.search("tinder.com") === -1) {
    return "";
  } else {
    let url = new URL(tab.url!);
    let pathSegments = url.pathname.split("/");
    let matchId = null;
    if (full) {
      matchId = pathSegments.slice(3)[0];
    } else {
      matchId = pathSegments.slice(3)[0]?.substring(0, 24);
    }
    return new Promise((resolve) => {
      resolve(matchId as string);
    });
  }
}
async function getXauthToken(): Promise<string> {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tab.id!,
      { action: "GetXauthToken" },
      (response) => {
        console.log("Xauth Token:", response.token);
        resolve(response.token as string);
      }
    );
  });
}
async function fetchMessagesFromAPI(matchId: string, xauthToken: string) {
  const response = await fetch(
    `https://api.gotinder.com/v2/matches/${matchId}/messages?locale=en-GB&count=100`,
    {
      headers: {
        "X-Auth-Token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    }
  );
  const data = await response.json();
  console.log("Messages Data:", data);
  return data;
}
chrome.runtime.onMessage.addListener(handleMessages);
async function handleMessages(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  switch (request.action) {
    case "Evaluate":
      getMatchId(true).then((matchId) => {
        sendResponse({ matchId: matchId });
      });
      return true;
      break;
    case "Rizz":
      let Id = await getMatchId(true);
      let token = await getXauthToken();
      fetchMessagesFromAPI(Id, token);
      return true;
      break;
    default:
      sendResponse({}); // Send an empty response for unrecognized actions
      break;
  }
}
