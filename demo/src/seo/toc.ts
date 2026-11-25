import { useEffect, useState } from "react";

/** One entry of a docs page's "On this page" list. */
export type TocItem = { id: string; text: string };

declare global {
  // Set by the prerender (second pass) so the server HTML of a page already holds its "On this page" list.
  var __sheenToc: Record<string, TocItem[]> | undefined;
}

let inline: Record<string, TocItem[]> | undefined;
function readInline(): Record<string, TocItem[]> {
  if (typeof document === "undefined") return {};
  try {
    const text = document.getElementById("sheen-toc")?.textContent;
    return text ? (JSON.parse(text) as Record<string, TocItem[]>) : {};
  } catch {
    return {};
  }
}

/** True for the ids React generates (useId): they change between renders, so they are no anchors. */
const generated = (id: string) => /^(_r_|:r)/.test(id);

/** The page's own section headings (h2 of a top-level section of the article) that carry a stable id. */
function scan(): TocItem[] {
  const out: TocItem[] = [];
  for (const h of document.querySelectorAll("main article h2[id]")) {
    if (generated(h.id) || h.closest("header")) continue;
    const section = h.closest("section");
    if (!section || section.parentElement?.closest("section")) continue;
    out.push({ id: h.id, text: h.textContent.trim() });
  }
  return out;
}

/**
 * The "On this page" entries of a route: from the prerender (server and the first client render) or, after a
 * client-side navigation, read from the page once it is on screen. Pages with fewer than four sections get none.
 */
export function useToc(path: string): TocItem[] {
  const initial = typeof window === "undefined" ? globalThis.__sheenToc?.[path] : (inline ??= readInline())[path];
  const [items, setItems] = useState<TocItem[]>(initial ?? []);
  useEffect(() => {
    if (initial) return;
    const found = scan();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the DOM once the new page is on screen; there is nothing to derive during render
    if (found.length >= 4) setItems(found);
  }, [initial, path]);
  return items;
}
