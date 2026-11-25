Canonical: https://lokendra-builds.github.io/sheenui/blocks/feature-grid

# React Feature Grid: Glass Cards in 2 to 4 Columns

URL: https://lokendra-builds.github.io/sheenui/blocks/feature-grid
Sidebar name: Feature grid

A React feature grid block with icon, title and text on glass cards in two to four columns, plus a highlight card. Container queries, accessible, MIT.

What it is: FeatureGrid is a React feature grid block of glass cards, each with an icon, a title and a line of text, in two to four columns that follow its own width. One optional highlight card spans two columns and is lit from a corner.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/feature-grid.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Feature grid

Files to copy from `theme/src/`:

- `blocks/feature-grid.tsx`
- `components/glass-card/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{light-follower.ts, tokens.ts}`
- `lib/{cn.ts, heading.ts, no-script-reveal.tsx}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: feature-grid. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { FeatureGrid, type FeatureGridItem } from "@/components/sheenui/blocks/feature-grid";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { FeatureGrid, type FeatureGridItem } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| features | FeatureGridItem[] | required | Lists the cards, which render in reading order (FeatureGridItem[]). |
| eyebrow | ReactNode | optional, no default | Shows a small label above the title (ReactNode). |
| title | ReactNode | optional, no default | Sets the section heading (ReactNode). |
| description | ReactNode | optional, no default | Sets the line under the heading (ReactNode). |
| columns | 2 \| 3 \| 4 | 3 | Columns on a wide block (2 \| 3 \| 4). The grid follows the block's own width, so it steps down to two and then one column. |
| headingLevel | HeadingLevelOption | 2 | Level of the section heading (1 to 6); the card headings sit one level below. "none" renders plain text, no headings. |
| labels | Partial<FeatureGridLabels> | defaultFeatureGridLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultFeatureGridLabels. All 2 keys of FeatureGridLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the section (string). |

## Example 1 of 2: Three columns with a highlight

highlight marks the card that matters most. A card with an href becomes one link with a single tab stop and a whole-card click target.

```tsx
import { FeatureGrid, type FeatureGridItem } from "@/components/sheenui/blocks/feature-grid";
// Package build (after the first npm release, or a packed tarball): import { FeatureGrid, type FeatureGridItem } from "@sheenui/theme";

const glyph = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const features: FeatureGridItem[] = [
  { id: "tokens", title: "Design tokens", description: "Colour, blur and motion live in CSS variables.", icon: glyph("M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5") },
  { id: "a11y", title: "Accessible by default", description: "Real keyboard support, roles and focus management.", icon: glyph("m5 12 4 4 10-10"), highlight: true },
  { id: "motion", title: "Springs, not tweens", description: "Interruptible motion with reduced-motion paths.", icon: glyph("M13 2 4 14h7l-1 8 9-12h-7l1-8Z") },
];

export function Example() {
  return (
    <FeatureGrid
      eyebrow="Why SheenUI"
      title="Everything a glass UI needs"
      description="One system for surfaces, motion and accessibility."
      features={features
        .slice(0, 3)
        .map((f) => (f.highlight ? { ...f, href: "/guides/accessible-glassmorphism" } : f))}
    />
  );
}
```

## Example 2 of 2: Four columns

columns={4} gives a four-up row on a wide block and steps down to three, two and one as the block narrows (container queries, so it works in a sidebar layout too).

```tsx
import { FeatureGrid } from "@/components/sheenui/blocks/feature-grid";
// Package build (after the first npm release, or a packed tarball): import { FeatureGrid } from "@sheenui/theme";

export function Example() {
  return (
    <FeatureGrid
      columns={4}
      title="Small parts, big range"
      features={[
        { id: "a", title: "Inputs", description: "Fields that share one height scale." },
        { id: "b", title: "Overlays", description: "Dialogs, drawers and menus." },
        { id: "c", title: "Charts", description: "Every chart has a table twin." },
        { id: "d", title: "Blocks", description: "Pages assembled from the parts." },
      ]}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Cards without an href are not stops. A card with an href has one link. |
| Enter | Follow the focused card's link. |

## Accessibility

- A <section> named by its heading (labels.region when there is no title); card titles are headings one level below it.
- A card's link is named by 'Learn more' plus the card's title, so a list of links is not a list of identical names.
- Icons are aria-hidden. The highlight card is also larger and first in its row, so nothing relies on colour.
- Cards rise on a spring when scrolled into view; reduced motion keeps a short fade.

## All exports on this page

- FeatureGrid — A grid of feature cards: an icon in a lit tile, a title and a line of text each, two to four columns by the block's own width.
- defaultFeatureGridLabels — The English FeatureGridLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the feature grid

- Use FeatureGrid under a hero to say what the product does in six or eight short cards, each with an icon in a lit tile, a title and one sentence.
- Use highlight on the one card that matters most; it is tinted with the accent, lit from a corner and spans two columns, so it is also larger and never relies on colour alone.
- Use href on a card to make it one link with a single tab stop and a whole-card click target, named by 'Learn more' plus the card's title.
- Skip it when the cards should hold live demos or charts; BentoGrid is built for that, while FeatureGrid is for plain copy and icons.
- Pair it with HeroSection above and Testimonials or Pricing below, and keep it to eight cards or fewer in view so the glass blur budget holds.


## Frequently asked questions

### How do I make a feature grid in React with FeatureGrid?

Pass features as { id, title, description, icon?, href?, highlight? } objects, and optionally eyebrow, title and description for the section heading. Set columns to 2, 3 or 4. The grid follows the block's own width with container queries, so it also works in a sidebar layout.

### How do the columns behave on small screens?

The columns step down by the block's own width, not the viewport: four becomes three, then two, then one. A highlight card spans two columns where there are at least two, and one column when the grid is single.

### How do I link a card without a nested-link mess?

Give the feature an href. The card renders one anchor whose ::after covers the whole card, so there is a single tab stop and the whole surface is clickable. Its accessible name is the 'Learn more' label plus the card title, so a list of cards does not read as identical links.

### What are the heading levels?

headingLevel (default 2) sets the section heading and the card titles sit one level below. Pass "none" to render plain text with no heading roles, for an example or an embed inside another widget.


## Related pages

- [Hero section](https://lokendra-builds.github.io/sheenui/blocks/hero-section)
- [Bento grid](https://lokendra-builds.github.io/sheenui/blocks/bento-grid)
- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Testimonials](https://lokendra-builds.github.io/sheenui/blocks/testimonials)
- [FAQ section](https://lokendra-builds.github.io/sheenui/blocks/faq-section)
- [Contact form](https://lokendra-builds.github.io/sheenui/blocks/contact-form)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
