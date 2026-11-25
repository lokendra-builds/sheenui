import { type ReactNode, useEffect, useState } from "react";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger, cn } from "@sheenui/theme";

import { useHeadingId } from "./heading-ids";

/*
 * The shared "read more" treatment: one glass accordion whose panels hold the long copy (the keyword sections of the home
 * page, a hub's overview, every FAQ). The text stays in the HTML: every panel is rendered hidden="until-found", so crawlers
 * read it, find-in-page opens it, and a visitor sees a short, designed list instead of a wall of prose.
 */

export type AboutItem = {
  /** Unique within the accordion; also the open-state key. */
  value: string;
  /** The trigger text: a heading of the page outline. */
  title: string;
  /** One line under the title (optional). */
  hint?: string;
  body: ReactNode;
};

type ListProps = {
  items: AboutItem[];
  /** Heading level of the triggers (the section's H2 sits above: 3 by default). */
  level?: 3 | 4;
  /** Number the triggers 01, 02, ... in a small tile. */
  numbered?: boolean;
  /** Values open on first render. */
  defaultOpen?: string[];
  /** Flat frost (no backdrop-filter) so a page with many glass surfaces stays inside the glass budget. */
  flat?: boolean;
  /** Names the region for screen readers. */
  label: string;
  /** Gives every trigger a stable id (`prefix` + value) so a URL hash opens and scrolls to its item (the FAQ: "faq-"). */
  anchorPrefix?: string;
  className?: string;
};

/**
 * The accordion alone. The root is a nested <section>, so the page's heading ids rule (a top-level section's headings
 * carry a stable id) applies to the section above, not to every question.
 */
export function AboutList({
  items,
  level = 3,
  numbered,
  defaultOpen = [],
  flat,
  label,
  className,
  anchorPrefix,
}: ListProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  // A URL hash that names one of the triggers opens that item and scrolls to it (after the lazy content above settled).
  const keys = items.map((item) => item.value).join("\u0000");
  useEffect(() => {
    if (!anchorPrefix) return;
    const openFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const hit = keys.split("\u0000").find((value) => anchorPrefix + value === hash);
      if (hit === undefined) return;
      setOpen((cur) => (cur.includes(hit) ? cur : [...cur, hit]));
      const go = () => document.getElementById(hash)?.scrollIntoView({ block: "start" });
      requestAnimationFrame(go);
      window.setTimeout(go, 400);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [anchorPrefix, keys]);

  // The anchor id sits on the item, not the trigger: an id on the trigger replaces Base UI's own and leaves the panel's aria-labelledby dangling.
  return (
    <Accordion
      render={<section role="group" aria-label={label} />}
      hiddenUntilFound
      value={open}
      onValueChange={(v) => setOpen(v.map(String))}
      className={cn("about-acc", flat && "home-flat", className)}
    >
      {items.map((item, i) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          id={anchorPrefix ? anchorPrefix + item.value : undefined}
          className="scroll-mt-24"
        >
          <AccordionTrigger
            headingLevel={level}
            description={item.hint}
            icon={
              numbered ? (
                <span
                  aria-hidden
                  data-llms="skip"
                  className="font-sheen-mono text-[0.7rem] font-semibold tracking-wider tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}{" "}
                </span>
              ) : undefined
            }
            className="text-[0.95rem] sm:text-base"
          >
            {item.title}
          </AccordionTrigger>
          <AccordionPanel contentClassName="max-w-3xl text-base text-pretty [&_p+p]:mt-3">{item.body}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** A titled section (H2) holding one or more accordions; a group may carry its own H3. */
export function AboutSection({
  title,
  lede,
  groups,
  flat,
  className,
}: {
  title: string;
  lede?: string;
  groups: { title?: string; items: AboutItem[]; numbered?: boolean; defaultOpen?: string[]; anchorPrefix?: string }[];
  flat?: boolean;
  className?: string;
}) {
  const id = useHeadingId(title);
  return (
    <section aria-labelledby={id} className={cn("about-section flex min-w-0 flex-col gap-5", className)}>
      <div className="flex max-w-3xl flex-col gap-1.5">
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        {lede && <p className="text-base text-pretty text-sheen-fg-muted">{lede}</p>}
      </div>
      {groups.map((g, gi) => (
        <AboutGroup key={g.title ?? gi} group={g} flat={flat} />
      ))}
    </section>
  );
}

function AboutGroup({
  group,
  flat,
}: {
  group: { title?: string; items: AboutItem[]; numbered?: boolean; defaultOpen?: string[]; anchorPrefix?: string };
  flat?: boolean;
}) {
  const id = useHeadingId(group.title);
  const label = group.title ?? "Details";
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {group.title && (
        <h3 id={id} className="text-lg font-semibold tracking-tight">
          {group.title}
        </h3>
      )}
      <AboutList
        items={group.items}
        level={group.title ? 4 : 3}
        numbered={group.numbered}
        defaultOpen={group.defaultOpen}
        flat={flat}
        label={label}
        anchorPrefix={group.anchorPrefix}
      />
    </div>
  );
}
