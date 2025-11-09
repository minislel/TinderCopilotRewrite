import "./popup.css";

interface ExtensionStorage {
  aiProvider: "gemini" | "openrouter" | null;
  geminiApiKey: string;
  openRouterApiKey: string;
  openRouterModel: string;
}

// Domyślne wartości dla naszego storage
const defaultStorage: ExtensionStorage = {
  aiProvider: null,
  geminiApiKey: "",
  openRouterApiKey: "",
  openRouterModel: "openai/gpt-4o",
};

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Krytyczny błąd: Nie znaleziono elementu o ID: #${id}`);
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
  getEl<HTMLButtonElement>("save-gemini").addEventListener(
    "click",
    saveGeminiSettings
  );

  const openRouterKeyInput = getEl<HTMLInputElement>("openrouter-key");
  const openRouterModelSelect = getEl<HTMLSelectElement>("openrouter-model");
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

    chrome.storage.local.set(
      {
        aiProvider: "gemini",
        geminiApiKey: geminiKey,
      },
      () => {
        showStatus("Zapisano ustawienia Gemini!");
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
      if (items.aiProvider === "gemini") {
        currentProviderStatus.textContent = "Gemini";
      } else if (items.aiProvider === "openrouter") {
        currentProviderStatus.textContent = "OpenRouter";
      } else {
        currentProviderStatus.textContent = "Nie skonfigurowano";
      }

      geminiKeyInput.value = items.geminiApiKey;
      openRouterKeyInput.value = items.openRouterApiKey;
      openRouterModelSelect.value = items.openRouterModel;
    });
  };

  restoreOptions();
  showView("main-menu");
});
