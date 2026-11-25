// The visible FAQ of a prerendered page, read back from its HTML. The FAQPage JSON-LD is built from exactly this
// (prerender.mjs) and seo-check compares the JSON-LD to it again in the written page, so the markup can never state
// a question or an answer the reader does not see. Every FAQ accordion item has an id with the "faq-" prefix
// (layout/Faq.tsx).
import { parse } from "node-html-parser";

const text = (node) => node.textContent.replace(/\s+/g, " ").trim();

/**
 * The questions and answers of a page's FAQ accordions, in document order.
 * @param {import("node-html-parser").HTMLElement | string} source rendered HTML (or a parsed root)
 * @returns {{ q: string, a: string }[]}
 */
export function visibleFaq(source) {
  const root = typeof source === "string" ? parse(source) : source;
  const out = [];
  for (const item of root.querySelectorAll('[id^="faq-"]')) {
    const trigger = item.querySelector('[data-slot="accordion-trigger"]');
    const panel = item.querySelector('[data-slot="accordion-panel"]');
    if (!trigger || !panel) continue;
    out.push({ q: text(trigger), a: text(panel) });
  }
  return out;
}
