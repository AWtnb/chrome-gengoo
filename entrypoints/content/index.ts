import { checkMode, convert } from "./helpers";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    const rootDiv = document.createElement("div");
    rootDiv.id = "extension-root";
    document.body.appendChild(rootDiv);

    const shadowRoot = rootDiv.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    container.className = "content_script";
    container.style.cssText = `
        position: absolute;
        border: 1px solid slateblue;
        z-index: 99999;
        background-color: white;
        display: none;
        font-size: 16px;
        color: #333;
    `;

    const textHolder = document.createElement("span");
    textHolder.className = "converted-text";
    textHolder.style.cssText = `
        padding: 2px;
    `;

    container.appendChild(textHolder);
    shadowRoot.appendChild(container);

    const hideContainer = () => {
      container.style.display = "none";
    };

    const popupContainer = () => {
      const a = document.activeElement;
      if (a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement) {
        hideContainer();
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount < 1) {
        hideContainer();
        return;
      }
      const t = sel.toString().trim();
      if (t.length < 2 || 10 < t.length) {
        hideContainer();
        return;
      }
      const mode = checkMode(t);
      if (mode === null) {
        hideContainer();
        return;
      }
      const conv = convert(t, mode);
      textHolder.textContent = conv;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const top = window.scrollY + rect.bottom + 5;
      const left = window.scrollX + rect.left;

      container.style.top = `${top}px`;
      container.style.left = `${left}px`;
      container.style.display = "block";
    };

    let debounceTimer: number | undefined;
    document.addEventListener("selectionchange", () => {
      if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        popupContainer();
      }, 200);
    });
  },
});
