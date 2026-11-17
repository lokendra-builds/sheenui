// The page's own sections (h2 of a top-level <section> with a stable id) for the "On this page" list. The ids
// are the slugs of the heading texts, set in React (layout/heading-ids.ts), so server and client agree.

import { parse } from "node-html-parser";

const generated = (id) => /^(_r_|_R_|:r)/.test(id);

/** @returns {{ id: string; text: string }[]} */
export function tocOf(body) {
  const article = parse(body).querySelector("article");
  const out = [];
  for (const h of article?.querySelectorAll("h2[id]") ?? []) {
    const id = h.getAttribute("id");
    if (!id || generated(id) || h.closest("header")) continue;
    const section = h.closest("section");
    if (!section || section.parentNode?.closest?.("section")) continue;
    out.push({ id, text: h.textContent.replace(/\s+/g, " ").trim() });
  }
  return out;
}
