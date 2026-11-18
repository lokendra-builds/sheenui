Canonical: https://lokendra-builds.github.io/sheenui/blocks/testimonials

# React Testimonials: Glass Quote Cards and Marquee

URL: https://lokendra-builds.github.io/sheenui/blocks/testimonials
Sidebar name: Testimonials

A React testimonials block with glass quote cards as a grid or a two-row marquee that pauses on hover, focus, off-screen and with a button. Free, MIT.

What it is: Testimonials is a React testimonials block that shows customer quotes on glass cards, as a grid or a marquee in one or two rows. The marquee rests on hover, focus, off-screen and has a Pause button.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/testimonials.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Testimonials

Files to copy from `theme/src/`:

- `blocks/testimonials.tsx`
- `components/button/`
- `components/glass-card/`
- `components/marquee/`
- `components/spinner/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, initials.ts, no-script-reveal.tsx, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: testimonials. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { type Testimonial, Testimonials } from "@/components/sheenui/blocks/testimonials";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type Testimonial, Testimonials } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| testimonials | Testimonial[] | required | Lists the quotes the section shows (Testimonial[]). |
| eyebrow | ReactNode | optional, no default | Shows a small label above the title (ReactNode). |
| title | ReactNode | optional, no default | Sets the section heading (ReactNode). |
| description | ReactNode | optional, no default | Sets the line under the heading (ReactNode). |
| layout | "grid" \| "marquee" | "grid" | "grid" lays the quotes out in columns; "marquee" scrolls them in one or two rows that rest when the block is off-screen, hovered or focused, with a Pause button. |
| columns | 2 \| 3 | 3 | Columns of the grid on a wide block (2 \| 3; it steps down by the block's own width). |
| rows | 2 \| 1 | 1 | Rows of the marquee (1 \| 2); the second row runs the other way. Needs at least four quotes. |
| speed | number | 32 | Sets the marquee speed in pixels per second (number). |
| paused | boolean | optional, no default | Controls whether the marquee is paused (boolean). Use with onPausedChange. |
| defaultPaused | boolean | false | Whether the marquee starts paused when uncontrolled (boolean). |
| onPausedChange | ((paused: boolean) => void) | optional, no default | Called when the Pause / Play button is pressed ((paused: boolean) => void). |
| headingLevel | HeadingLevelOption | 2 | Level of the section heading (1 to 6); "none" renders plain text. |
| labels | Partial<TestimonialsLabels> | defaultTestimonialsLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultTestimonialsLabels. All 4 keys of TestimonialsLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the section (string). |

## Example 1 of 2: Grid

Each quote is a figure with a blockquote and a caption. Ratings are announced as text through labels.rating.

```tsx
import { Testimonials, type Testimonial } from "@/components/sheenui/blocks/testimonials";
// Package build (after the first npm release, or a packed tarball): import { Testimonials, type Testimonial } from "@sheenui/theme";

const quotes: Testimonial[] = [
  { id: "1", quote: "We shipped the dashboard in a week.", name: "Sam Rivera", role: "Engineering lead", rating: 5 },
  { id: "2", quote: "The focus states are the best I have seen.", name: "Jo Lindqvist", role: "Product designer", rating: 5 },
  { id: "3", quote: "Reduced motion actually works.", name: "Priya Nair", role: "Accessibility specialist", rating: 5 },
];

export function Example() {
  return <Testimonials eyebrow="Kind words" title="Loved by small teams" testimonials={quotes} />;
}
```

## Example 2 of 2: Marquee, two rows

The second row runs the other way. One Pause button drives both rows (controlled with paused and onPausedChange). Hover or focus rests the strip; it also rests off-screen and in a background tab, and stands still under reduced motion.

```tsx
import { useState } from "react";
import { Testimonials, type Testimonial } from "@/components/sheenui/blocks/testimonials";
// Package build (after the first npm release, or a packed tarball): import { Testimonials, type Testimonial } from "@sheenui/theme";

declare const quotes: Testimonial[]; // at least four quotes for two rows

export function Example() {
  const [paused, setPaused] = useState(false);
  return (
    <Testimonials
      title="Loved by small teams"
      layout="marquee"
      rows={2}
      speed={28}
      paused={paused}
      onPausedChange={setPaused}
      testimonials={quotes}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The grid has no stops. In the marquee, the Pause / Play button comes first. |
| Enter / Space | Pause or resume the marquee. |
| Focus inside the strip | Rests the marquee while focus is there. |

## Accessibility

- Each quote is a <figure> with a <blockquote> and a <figcaption>; the list of quotes is named by labels.list.
- The marquee has a Pause button (WCAG 2.2.2) and rests while hovered, focused, off-screen or in a hidden tab. Reduced motion stops it.
- Avatars and the quote mark are decorative; a star rating is a text alternative ('Rated 5 out of 5').
- Each card is one glass surface; the marquee fades each card's own edge, never a wrapper of glass.

## All exports on this page

- Testimonials — A wall of customer quotes in glass cards, as a grid or as a marquee.
- defaultAuthSplitTestimonials — Sample testimonials shown when testimonials is omitted; replace them with real customer quotes.
- defaultTestimonialsLabels — The English TestimonialsLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the testimonials section

- Use Testimonials in grid layout for three to six longer quotes under the features or the pricing, where each quote is read and the cards rise on a spring as they scroll into view.
- Use layout="marquee" for many short quotes; rows={2} runs the second row the other way, and one controlled Pause button can drive both rows.
- Use rating on a quote to show stars; they are announced as text through labels.rating ('Rated 5 out of 5'), so the rating never lives in colour or shape alone.
- Skip the marquee when each quote is long or when your audience reads slowly; a paused strip or the grid is easier, and WCAG 2.2.2 expects a way to stop moving content.
- Pair it with HeroSection's logo strip, FaqSection and Pricing, and use real quotes with permission rather than invented ones on a live site.


## Frequently asked questions

### How do I show testimonials as a marquee in React?

Pass layout="marquee" with your testimonials. Add rows={2} for two rows and speed for pixels per second. The strip eases to a stop on hover and when focus is inside it, rests while off-screen or in a background tab, and a Pause button (labels.marquee) comes first in the tab order.

### Can one button pause both marquee rows?

Yes. Control it with paused and onPausedChange and keep the state in your component. Only the first row renders the Pause button; both rows follow the same paused value, so one control drives them together.

### How is a quote marked up for screen readers?

Each quote is a figure with a blockquote and a figcaption, inside a list named by labels.list. The avatar and the quote mark are decorative, and the star rating is a role="img" with a text alternative from labels.rating.

### What happens with reduced motion?

The grid cards only fade in with no movement, and the marquee does not scroll at all. The glass cards stay readable, and the Pause button still works for anyone who has not set the preference.


## Related pages

- [FAQ section](https://lokendra-builds.github.io/sheenui/blocks/faq-section)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)
- [Pricing](https://lokendra-builds.github.io/sheenui/blocks/pricing)
- [Contact form](https://lokendra-builds.github.io/sheenui/blocks/contact-form)
- [Site footer](https://lokendra-builds.github.io/sheenui/blocks/site-footer)
- [404 page](https://lokendra-builds.github.io/sheenui/blocks/not-found-page)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
