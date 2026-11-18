Canonical: https://lokendra-builds.github.io/sheenui/blocks/faq-section

# React FAQ Section with FAQPage JSON-LD Helper

URL: https://lokendra-builds.github.io/sheenui/blocks/faq-section
Sidebar name: FAQ section

A React FAQ section: accordion questions on glass with find-in-page, plus faqPageJsonLd that returns schema.org FAQPage data. Accessible, free, MIT.

What it is: FaqSection is a React FAQ section block: a heading and an accordion of questions on glass whose closed answers open on find-in-page. faqPageJsonLd(items) returns the schema.org FAQPage object for the same questions.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/faq-section.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > FAQ section

Files to copy from `theme/src/`:

- `blocks/faq-section.tsx`
- `components/accordion/`
- `lib/{cn.ts, heading.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: faq-section. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { type FaqItem, faqPageJsonLd, FaqSection } from "@/components/sheenui/blocks/faq-section";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type FaqItem, faqPageJsonLd, FaqSection } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | FaqItem[] | required | Lists the questions, which render in the order given (FaqItem[]). |
| eyebrow | ReactNode | optional, no default | Shows a small label above the title (ReactNode). |
| title | ReactNode | optional, no default | Sets the section heading (ReactNode). |
| description | ReactNode | optional, no default | Sets the line under the heading (ReactNode). |
| footer | ReactNode | optional, no default | Content under the heading or under the list, for a "still stuck?" line and a link (ReactNode). |
| layout | "split" \| "stacked" | "stacked" | "stacked" centers the heading above the list; "split" puts the heading and the footer beside the list on a wide block. |
| variant | "glass" \| "separated" | "glass" | Surface of the list: "glass" is one glass card, "separated" gives each question its own card. |
| multiple | boolean | false | Let several answers be open at once (boolean). |
| value | string[] | optional, no default | Controls which items are open (string[] of item ids). Use with onValueChange. |
| defaultValue | string[] | optional, no default | The items open at first when uncontrolled (string[]). |
| onValueChange | ((value: string[]) => void) | optional, no default | Called with the open item ids whenever one opens or closes ((value: string[]) => void). |
| headingLevel | HeadingLevelOption | 2 | Level of the section heading (1 to 6); the questions sit one level below. "none" renders plain text, no headings. |
| labels | Partial<FaqSectionLabels> | defaultFaqSectionLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultFaqSectionLabels. Its only key is listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the section (string). |

## Example 1 of 2: Stacked

Press Ctrl or Cmd + F and search for 'Base UI': the closed answer opens. defaultValue opens an item at first; multiple lets several stay open.

```tsx
import { FaqSection, type FaqItem } from "@/components/sheenui/blocks/faq-section";
// Package build (after the first npm release, or a packed tarball): import { FaqSection, type FaqItem } from "@sheenui/theme";

const items: FaqItem[] = [
  { id: "license", question: "What licence is SheenUI under?", answer: "MIT. Copy the source and change whatever you need." },
  { id: "react", question: "Which React versions work?", answer: "React 19." },
  { id: "theme", question: "Can I change the colours?", answer: "Yes. Everything reads --sheen-* tokens." },
];

export function Example() {
  return <FaqSection title="Questions, answered" items={items} defaultValue={["license"]} />;
}
```

## Example 2 of 2: Split layout and structured data

layout='split' keeps the heading and a footer beside the list. faqPageJsonLd(items) returns the FAQPage object: render it into a script tag yourself (it never touches the document), and keep its text equal to what the page shows.

```tsx
import { FaqSection, faqPageJsonLd, type FaqItem } from "@/components/sheenui/blocks/faq-section";
// Package build (after the first npm release, or a packed tarball): import { FaqSection, faqPageJsonLd, type FaqItem } from "@sheenui/theme";

const items: FaqItem[] = [
  { id: "license", question: "What licence is SheenUI under?", answer: "MIT." },
  {
    id: "a11y",
    question: "How accessible is it?",
    answer: <p>Keyboard support, visible focus and a reduced-motion path.</p>,
    answerText: "Keyboard support, visible focus and a reduced-motion path.",
  },
];

export function Example() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)) }} />
      <FaqSection
        layout="split"
        variant="separated"
        title="Still curious?"
        description="The short answers."
        footer={<a href="https://example.com/contact">Ask us something else</a>}
        items={items}
      />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Move between the questions. |
| Enter / Space | Open or close the focused question. |
| Arrow Down / Arrow Up | Move to the next or previous question. |
| Home / End | First or last question. |

## Accessibility

- A <section> named by its heading; each question is a button inside a heading one level below it, with aria-expanded and aria-controls.
- Closed answers use hidden='until-found', so the browser's find-in-page opens the matching one.
- faqPageJsonLd only returns an object. Items whose answer is not a string and that have no answerText are left out, because JSON-LD answers are plain text.
- The list is one glass card ('glass') or one card per question ('separated'); the open height animates in about 220 ms and is skipped under reduced motion.

## All exports on this page

- FaqSection — A frequently-asked-questions section: a heading and an accordion of questions in glass, with find-in-page that opens the matching answer.
- defaultFaqSectionLabels — The English FaqSectionLabels used when labels is omitted; a partial labels prop is merged over it.
- faqPageJsonLd — Builds the schema.org FAQPage JSON-LD object for a list of FAQ items, so search engines can read the same questions the page shows.


## When to use the FAQ section

- Use FaqSection near the pricing or the footer to answer objections in one place, with the first question open by default through defaultValue.
- Use layout="split" on a wide page to keep the heading and a 'still stuck?' footer beside a long list, and variant="separated" when each question should be its own card.
- Use faqPageJsonLd(items) to build the structured data for the same items, then render it into a script tag yourself; the helper only returns data and never touches the document.
- Skip structured data for questions that are not visible on the page; search engines expect the JSON-LD text to match what the page shows.
- Pair it with Pricing and ContactForm, and keep each answer short with a link to the docs for the long version.


## Frequently asked questions

### How do I build an FAQ section in React with FaqSection?

Pass items as { id, question, answer } objects, plus an optional title, description and footer. Use defaultValue for the items open at first, multiple to let several stay open, and value with onValueChange to control it. Each question is a button inside a heading one level below the section.

### How do I add FAQPage JSON-LD?

Call faqPageJsonLd(items) and serialise the result into a script tag of type application/ld+json in your head or a server component. Items whose answer is not a string need an answerText, because JSON-LD answers are plain text; items without text are left out.

### Does find-in-page open closed answers?

Yes. The accordion uses hidden="until-found", so a browser's find-in-page search opens the matching answer and scrolls to it. That makes a long FAQ searchable without a custom search box.

### How accessible is the accordion?

It is built on Base UI: every trigger is a native button in a heading with aria-expanded and aria-controls, Enter and Space toggle it, and Arrow keys, Home and End move between questions. The open height animation is skipped under reduced motion.


## Related pages

- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Pricing](https://lokendra-builds.github.io/sheenui/blocks/pricing)
- [Contact form](https://lokendra-builds.github.io/sheenui/blocks/contact-form)
- [Site footer](https://lokendra-builds.github.io/sheenui/blocks/site-footer)
- [404 page](https://lokendra-builds.github.io/sheenui/blocks/not-found-page)
- [Announcement banner](https://lokendra-builds.github.io/sheenui/blocks/announcement-banner)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
