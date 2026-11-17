/**
 * Per-page "When to use it" bullets and FAQ for the docs pages (one template for every page). One record per route,
 * written by hand from each component's source; `Page` renders them below the demos and props tables.
 * The files in ./content are loaded on demand by `loadPageContent` (head.ts): the prerender inlines a page's own row.
 */
export type PageContent = {
  /** 4 to 5 concrete bullets: use cases, when not to use it (and what to use instead), what to pair it with. */
  when: string[];
  /** 4 questions specific to the component, answered from its source. Shown in the FAQ accordion; the prerender reads the visible FAQ back into the page's FAQPage JSON-LD. */
  faq: { q: string; a: string }[];
  /** An optional short comparison section ("Sonner alternative"): a heading and one paragraph, shown after the bullets. */
  compare?: { title: string; text: string };
};
