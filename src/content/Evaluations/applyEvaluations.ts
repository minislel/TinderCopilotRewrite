import { Evaluation } from "@/types";
import { evalCache } from "@/content/Evaluations/getEvaluations";
import { getThreadIdFromUrl as getThreadId } from "@/content/content";
export async function applyEvaluations(evals: Array<Evaluation>) {
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
export async function applyCachedEvaluations() {
  const threadId = await getThreadId(true);
  const cachedEvals = evalCache[threadId];
  if (cachedEvals) {
    await applyEvaluations(cachedEvals);
  }
}
