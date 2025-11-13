export function showAICompletionShadow(completion: string) {
  const chatInput = document.querySelector("textarea") as HTMLTextAreaElement;
  if (!chatInput) return;
  console.log("Showing AI completion shadow:", completion);
  const parent = chatInput.parentElement;
  if (!parent) return;

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
