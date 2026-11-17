import type { ReactNode } from "react";

import { AboutSection } from "./AboutAccordion";
import { slugify } from "./heading-ids";

export type FaqItem = { q: string; a: ReactNode };

/**
 * The FAQ: one glass accordion, every question a heading and a keyboard-reachable button. The answers are in the HTML
 * (hidden="until-found": crawlers and answer engines read them, find-in-page opens them), and the prerender reads the visible questions back into the FAQPage JSON-LD (scripts/lib/faq.mjs).
 */
export function Faq({ items, title = "Frequently asked questions" }: { items: FaqItem[]; title?: string }) {
  return (
    <AboutSection
      title={title}
      className="max-w-4xl"
      groups={[
        { anchorPrefix: "faq-", items: items.map(({ q, a }) => ({ value: slugify(q), title: q, body: <p>{a}</p> })) },
      ]}
    />
  );
}
