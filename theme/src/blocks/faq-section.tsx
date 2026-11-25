"use client";

import { useId, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../lib/heading";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "../components/accordion/accordion";

/** One question of `FaqSection`. */
export type FaqItem = {
  /** Stable key; also the value of the open item. */
  id: string;
  /** The question, as plain text (it is also what `faqPageJsonLd` publishes). */
  question: string;
  /** The answer: text or any `ReactNode` (links, lists, code). */
  answer: ReactNode;
  /** The answer as plain text for `faqPageJsonLd`, when `answer` is not a string. Items with no plain text are left out of the JSON-LD. */
  answerText?: string;
};

/** Every string `FaqSection` adds around your content, so the block can be translated. */
export type FaqSectionLabels = {
  /** Accessible name of the `<section>` when there is no `title`. */
  region: string;
};

/** The English {@link FaqSectionLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultFaqSectionLabels: FaqSectionLabels = { region: "Frequently asked questions" };

/** Props of `FaqSection`. */
export type FaqSectionProps = {
  /** Lists the questions, which render in the order given (`FaqItem[]`). */
  items: FaqItem[];
  /** Shows a small label above the title (`ReactNode`). */
  eyebrow?: ReactNode;
  /** Sets the section heading (`ReactNode`). */
  title?: ReactNode;
  /** Sets the line under the heading (`ReactNode`). */
  description?: ReactNode;
  /** Content under the heading or under the list, for a "still stuck?" line and a link (`ReactNode`). */
  footer?: ReactNode;
  /**
   * `"stacked"` centers the heading above the list; `"split"` puts the heading and the footer beside the list on a wide block.
   * @default "stacked"
   */
  layout?: "stacked" | "split";
  /**
   * Surface of the list: `"glass"` is one glass card, `"separated"` gives each question its own card.
   * @default "glass"
   */
  variant?: "glass" | "separated";
  /**
   * Let several answers be open at once (`boolean`).
   * @default false
   */
  multiple?: boolean;
  /** Controls which items are open (`string[]` of item ids). Use with `onValueChange`. */
  value?: string[];
  /** The items open at first when uncontrolled (`string[]`). */
  defaultValue?: string[];
  /** Called with the open item ids whenever one opens or closes (`(value: string[]) => void`). */
  onValueChange?: (value: string[]) => void;
  /**
   * Level of the section heading (`1` to `6`); the questions sit one level below. `"none"` renders plain text, no headings.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<FaqSectionLabels>`). */
  labels?: Partial<FaqSectionLabels>;
  /** Adds extra classes to the section (`string`). */
  className?: string;
};

/** The schema.org `FAQPage` object `faqPageJsonLd` returns. */
export type FaqPageJsonLd = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
};

/**
 * Builds the schema.org `FAQPage` JSON-LD object for a list of FAQ items, so search engines can read the same questions
 * the page shows. It only returns data: it never touches the document. Serialise it into a
 * `<script type="application/ld+json">` yourself (in your page head or a server component). Items whose answer is not a
 * string and that have no `answerText` are skipped, because JSON-LD answers are plain text.
 *
 * Keyboard: not applicable, it is a pure function.
 * Accessibility: the visible block stays the source of truth; keep the JSON-LD text equal to what the page shows.
 *
 * @param items The same `FaqItem[]` you pass to `FaqSection`.
 * @returns The `FAQPage` object, ready for `JSON.stringify`.
 * @example
 * ```tsx
 * import { FaqSection, faqPageJsonLd, type FaqItem } from "@sheenui/theme";
 *
 * export function Faq() {
 *   const items: FaqItem[] = [
 *     { id: "price", question: "Is it free?", answer: "Yes, MIT licensed." },
 *     { id: "ssr", question: "Does it work with SSR?", answer: <p>Yes.</p>, answerText: "Yes." },
 *   ];
 *   return (
 *     <>
 *       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)) }} />
 *       <FaqSection items={items} title="Questions" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /blocks/faq-section
 */
export function faqPageJsonLd(items: readonly FaqItem[]): FaqPageJsonLd {
  const mainEntity: FaqPageJsonLd["mainEntity"] = [];
  for (const item of items) {
    const text = item.answerText ?? (typeof item.answer === "string" ? item.answer : undefined);
    if (!text) continue;
    mainEntity.push({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text },
    });
  }
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
}

/**
 * A frequently-asked-questions section: a heading and an accordion of questions in glass, with find-in-page that opens
 * the matching answer. Use it near the pricing or the footer; pair it with `faqPageJsonLd(items)` to publish the same
 * questions as structured data.
 *
 * Props (see `FaqSectionProps`): `items` (`{ id, question, answer, answerText? }[]`), `eyebrow`, `title`, `description`,
 * `footer`, `layout` (`"stacked"`), `variant` (`"glass"`), `multiple` (`false`), `value` / `defaultValue` /
 * `onValueChange` (open item ids), `headingLevel` (`2`), `labels` (`Partial<FaqSectionLabels>`), `className`.
 *
 * Keyboard: Tab moves between the questions; Enter or Space opens and closes the focused one; Arrow Up / Down, Home and
 * End move between questions.
 * Accessibility: a named group (`role="group"`, not a landmark, so repeated sections never collide) labelled by its heading (or `labels.region`); each question is a button inside a heading one
 * level below the title, with `aria-expanded` and `aria-controls`; closed answers stay findable by the browser's find-in-page.
 * Glass and motion: one backdrop-blurred card for the whole list (`"glass"`); the open height animates in about 220 ms and
 * is skipped under reduced motion.
 *
 * @example
 * ```tsx
 * import { FaqSection } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <FaqSection
 *       title="Good questions"
 *       defaultValue={["license"]}
 *       items={[
 *         { id: "license", question: "What licence is it under?", answer: "MIT. Copy the source and make it yours." },
 *         { id: "react", question: "Which React versions work?", answer: "React 19." },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/faq-section
 */
export function FaqSection({
  items,
  eyebrow,
  title,
  description,
  footer,
  layout = "stacked",
  variant = "glass",
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  headingLevel = 2,
  labels,
  className,
}: FaqSectionProps) {
  const L = { ...defaultFaqSectionLabels, ...labels };
  const headingId = useId();
  const Heading = HEADING_TAGS[headingLevel];
  const split = layout === "split";
  const hasHeader = Boolean(eyebrow) || Boolean(title) || Boolean(description);

  return (
    <section
      data-slot="faq-section"
      // A named group, not a region landmark: the same section can appear twice on one page (a stage copy and an example),
      // and duplicate landmark names fail axe's landmark-unique. The name is still read out.
      role="group"
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : L.region}
      className={cn(
        "@container grid w-full min-w-0 gap-10",
        split && "@4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @4xl:gap-16",
        className,
      )}
    >
      {(hasHeader || (split && footer)) && (
        <div
          className={cn(
            "flex min-w-0 flex-col gap-3",
            split
              ? "items-start text-start @4xl:sticky @4xl:top-24 @4xl:self-start"
              : "mx-auto max-w-2xl items-center text-center",
          )}
        >
          {eyebrow && <p className="text-sm font-semibold tracking-widest text-sheen-accent uppercase">{eyebrow}</p>}
          {title && (
            <Heading
              id={headingId}
              className="font-sheen-display text-3xl font-semibold tracking-(--sheen-display-tracking) text-balance @xl:text-5xl"
            >
              {title}
            </Heading>
          )}
          {description && <p className="text-base text-pretty text-sheen-fg-muted @xl:text-lg">{description}</p>}
          {split && footer && <div className="pt-3 text-sheen-fg-muted">{footer}</div>}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-8">
        <Accordion
          variant={variant}
          multiple={multiple}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange && ((next) => onValueChange(next as string[]))}
          hiddenUntilFound
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger headingLevel={headingBelow(headingLevel, 1)} indicator="plus">
                {item.question}
              </AccordionTrigger>
              <AccordionPanel>
                <div className="text-pretty text-sheen-fg-muted">{item.answer}</div>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        {!split && footer && <div className="text-center text-sheen-fg-muted">{footer}</div>}
      </div>
    </section>
  );
}
