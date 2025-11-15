import { checkMode, convert } from "../scripts/helpers";

let unmount: () => void;

if (import.meta.webpackHot) {
  import.meta.webpackHot?.accept();
  import.meta.webpackHot?.dispose(() => unmount?.());
}

if (document.readyState === "complete") {
  unmount = initial() || (() => {});
} else {
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") unmount = initial() || (() => {});
  });
}

function initial() {
  const rootDiv = document.createElement("div");
  rootDiv.id = "extension-root";
  document.body.appendChild(rootDiv);

  const shadowRoot = rootDiv.attachShadow({ mode: "open" });
  const contentDiv = document.createElement("div");
  contentDiv.className = "content_script";

  const convertedTextElement = document.createElement("p");
  convertedTextElement.className = "converted-text";
  contentDiv.appendChild(convertedTextElement);
  shadowRoot.appendChild(contentDiv);

  const style = new CSSStyleSheet();
  shadowRoot.adoptedStyleSheets = [style];
  fetchCSS().then((response) => style.replace(response));

  if (import.meta.webpackHot) {
    import.meta.webpackHot?.accept("./styles.css", () => {
      fetchCSS().then((response) => style.replace(response));
    });
  }

  const hideContentDiv = () => {
    contentDiv.style.display = "none";
  };

  document.addEventListener("selectionchange", () => {
    if (document.activeElement instanceof HTMLInputElement) {
      hideContentDiv();
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount < 1) {
      hideContentDiv();
      return;
    }
    const t = sel.toString().trim();
    if (t.length < 2 || 10 < t.length) {
      hideContentDiv();
      return;
    }
    const mode = checkMode(t);
    if (mode === null) {
      hideContentDiv();
      return;
    }
    const conv = convert(t, mode);
    convertedTextElement.textContent = conv;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const top = window.scrollY + rect.bottom + 5;
    const left = window.scrollX + rect.left;

    contentDiv.style.top = `${top}px`;
    contentDiv.style.left = `${left}px`;
    contentDiv.style.display = "block";
  });

  return () => {
    rootDiv.remove();
  };
}

async function fetchCSS() {
  const cssUrl = new URL("./styles.css", import.meta.url);
  const response = await fetch(cssUrl);
  const text = await response.text();
  return response.ok ? text : Promise.reject(text);
}
