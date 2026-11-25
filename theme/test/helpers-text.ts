// Text helpers: the accessible text of a subtree, live-region texts and the reduced-motion switch.

/**
 * The text a screen reader would read for an element: text nodes outside aria-hidden / hidden
 * subtrees (visually hidden `sr-only` text counts, as it does for assistive tech).
 */
export function accessibleText(root: Element): string {
  let out = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? "";
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.getAttribute("aria-hidden") === "true" || node.hasAttribute("hidden")) return;
    if (node.tagName === "STYLE" || node.tagName === "SCRIPT") return;
    node.childNodes.forEach(walk);
  };
  walk(root);
  return out.replace(/\s+/g, " ").trim();
}

/** Count of non-overlapping occurrences of `needle` in `haystack`. */
export function countOf(haystack: string, needle: string): number {
  return needle ? haystack.split(needle).length - 1 : 0;
}

/** Sets `html[data-motion="reduced"]` (same switch as helpers.reduceMotion, importable without the other helpers). */
export function setReducedMotion() {
  document.documentElement.setAttribute("data-motion", "reduced");
}

/** Text of every polite / assertive live region and status / alert role on the page (what a screen reader would announce). */
export function liveTexts(root: ParentNode = document): string[] {
  return [...root.querySelectorAll('[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"]')]
    .map((n) => n.textContent.trim())
    .filter(Boolean);
}
