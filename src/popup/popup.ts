import "./popup.css";

import { AIProvider } from "@/AI/AIProviderEnum";
import { OpenRouterModel } from "@/AI/openrouterModelEnum";
import { GeminiModel } from "@/AI/geminiModelEnum";
interface ExtensionStorage {
  aiProvider: AIProvider | null;
  geminiApiKey: string;
  openRouterApiKey: string;
  openRouterModel: OpenRouterModel;
  geminiModel: GeminiModel;
  geminiThinkingBudget: number;
}
function mapTokensToRizz(tokens: number): number {
  const MIN_TOKENS = 100;
  const MAX_TOKENS = 5000;

  const clampedTokens = Math.min(Math.max(tokens, MIN_TOKENS), MAX_TOKENS);

  const range = MAX_TOKENS - MIN_TOKENS;
  if (range === 0) return 100;

  const ratio = (clampedTokens - MIN_TOKENS) / range;

  const percent = ratio * 100;

  return Math.round(percent / 5) * 5;
}

// Domyślne wartości dla naszego storage
const defaultStorage: ExtensionStorage = {
  aiProvider: AIProvider.OPENROUTER,
  geminiApiKey: "",
  openRouterApiKey: "",
  openRouterModel: OpenRouterModel.MINIMAX,
  geminiModel: GeminiModel.GeminiFlashLatest,
  geminiThinkingBudget: 128,
};

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`${id} not found`);
  }
  return el as T;
}

document.addEventListener("DOMContentLoaded", () => {
  const views = document.querySelectorAll(".view") as NodeListOf<HTMLElement>;
  const statusMessage = getEl<HTMLParagraphElement>("status-message");
  const currentProviderStatus = getEl<HTMLParagraphElement>(
    "current-provider-status"
  );

  getEl<HTMLButtonElement>("go-to-gemini").addEventListener("click", () =>
    showView("gemini-menu")
  );
  getEl<HTMLButtonElement>("go-to-openrouter").addEventListener("click", () =>
    showView("openrouter-menu")
  );

  const geminiKeyInput = getEl<HTMLInputElement>("gemini-key");
  const geminiModelSelect = getEl<HTMLSelectElement>("gemini-model");
  const geminiRizzSlider = getEl<HTMLInputElement>("gemini-budget-slider");
  const geminiRizzValue = getEl<HTMLSpanElement>("gemini-budget-value");

  geminiRizzSlider.addEventListener("input", (e) => {
    const percentValue: number = (e.target as HTMLInputElement)
      .value as unknown as number;
    geminiRizzValue.textContent = `${mapTokensToRizz(percentValue)}%`;
  });
  const geminiModelOptions = Object.values(GeminiModel);
  geminiModelOptions.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    geminiModelSelect.appendChild(option);
  });

  getEl<HTMLButtonElement>("save-gemini").addEventListener(
    "click",
    saveGeminiSettings
  );

  const openRouterKeyInput = getEl<HTMLInputElement>("openrouter-key");
  const openRouterModelSelect = getEl<HTMLSelectElement>("openrouter-model");
  const modelOptions = Object.values(OpenRouterModel);
  modelOptions.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    openRouterModelSelect.appendChild(option);
  });
  getEl<HTMLButtonElement>("save-openrouter").addEventListener(
    "click",
    saveOpenRouterSettings
  );

  document.querySelectorAll(".back-button").forEach((button) => {
    button.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      showView(target.dataset.target!);
    });
  });

  const showView = (viewId: string) => {
    views.forEach((view) => view.classList.remove("active"));
    getEl<HTMLElement>(viewId).classList.add("active");
  };

  const showStatus = (message: string) => {
    statusMessage.textContent = message;
    setTimeout(() => {
      statusMessage.textContent = "";
    }, 2000);
  };

  function saveGeminiSettings() {
    const geminiKey = geminiKeyInput.value;
    const geminiModel = geminiModelSelect.value;
    const geminiBudget = geminiRizzSlider.value;
    chrome.storage.local.set(
      {
        aiProvider: AIProvider.GEMINI,
        geminiApiKey: geminiKey,
        geminiModel: geminiModel,
        geminiThinkingBudget: geminiBudget,
      },
      () => {
        showStatus("Gemini settings saved!");
        restoreOptions();
        showView("main-menu");
      }
    );
  }

  function saveOpenRouterSettings() {
    const openRouterKey = openRouterKeyInput.value;
    const openRouterModel = openRouterModelSelect.value;

    chrome.storage.local.set(
      {
        aiProvider: "openrouter",
        openRouterApiKey: openRouterKey,
        openRouterModel: openRouterModel,
      },
      () => {
        showStatus("Zapisano ustawienia OpenRouter!");
        restoreOptions();
        showView("main-menu");
      }
    );
  }

  const restoreOptions = () => {
    chrome.storage.local.get(defaultStorage, (items: ExtensionStorage) => {
      geminiKeyInput.value = items.geminiApiKey;
      const rizzPercent = mapTokensToRizz(items.geminiThinkingBudget);
      geminiRizzSlider.value = items.geminiThinkingBudget.toString();
      geminiRizzValue.textContent = `${rizzPercent}%`;

      if (items.aiProvider === AIProvider.GEMINI) {
        currentProviderStatus.textContent = "Gemini";
      } else if (items.aiProvider === AIProvider.OPENROUTER) {
        currentProviderStatus.textContent = "OpenRouter";
      } else {
        currentProviderStatus.textContent =
          "Unconfigured. Please set up an AI provider.";
      }

      geminiKeyInput.value = items.geminiApiKey;
      openRouterKeyInput.value = items.openRouterApiKey;
      openRouterModelSelect.value = items.openRouterModel;
      geminiModelSelect.value = items.geminiModel;
    });
  };

  restoreOptions();
  showView("main-menu");
});
