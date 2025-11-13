import { Evaluation } from "@/types";
import { applyEvaluations } from "@/content/Evaluations/applyEvaluations";
export const evalCache: Record<string, Array<Evaluation>> = {};

export async function getEvaluations(event: MouseEvent) {
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
