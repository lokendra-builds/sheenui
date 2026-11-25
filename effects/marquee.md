Canonical: https://lokendra-builds.github.io/sheenui/effects/marquee

# React Marquee: Infinite Logo & Testimonial Scroll

URL: https://lokendra-builds.github.io/sheenui/effects/marquee
Sidebar name: Marquee

A seamless infinite marquee for React logos and testimonials: eases to a stop on hover and focus, has a Pause button, supports RTL and reduced motion. MIT.

What it is: A React marquee for an endless, seamless strip of logos or testimonials that eases to a stop under the mouse or keyboard focus. Use it as an infinite logo carousel for a trusted-by strip under a landing page hero, where customer logos scroll in a seamless loop at a steady speed in pixels per second.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/marquee.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Marquee

Files to copy from `theme/src/`:

- `components/marquee/`
- `components/button/`
- `components/spinner/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: marquee. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Marquee } from "@/components/sheenui/marquee/marquee";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Marquee } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | The items: each child is one item (a logo, a card…). |
| speed | number | 40 | Sets the speed in px per second. |
| reverse | boolean | false | Move towards the end (right in LTR, or down when vertical) instead of the start. |
| vertical | boolean | false | Scroll vertically. Give the marquee a height with className (default h-96). |
| gap | number | 24 | Sets the space between items, in px. |
| pauseOnHover | boolean | true | Ease to a stop while the mouse is over it. |
| fade | boolean | true | Fades out the two edges of the strip. |
| fadeSize | number | 64 | Length of each faded edge, in px (at most 12% of the strip, so narrow strips stay readable). |
| controls | boolean | true | Show the Pause / Play button. Keep it unless you provide your own control (WCAG 2.2.2). |
| paused | boolean | optional, no default | Paused (controlled). Use with onPausedChange, e.g. to drive several marquees from one button. |
| defaultPaused | boolean | false | Starts in the paused state (uncontrolled). |
| onPausedChange | ((paused: boolean) => void) | optional, no default | Called when the Pause / Play button is pressed. |
| listLabel | string | optional, no default | Accessible name for the list of items, e.g. "Customers". |
| itemClassName | string | optional, no default | Classes for every item (<li>). Put a glass class here to make each item a glass card. |
| labels | Partial<MarqueeLabels> | defaultMarqueeLabels | Text of the Pause / Play button; a partial object over the English defaults, so pass only the keys you translate. Every other string, for translation: labels={{ pause: "…" }}; omitted keys keep the English of defaultMarqueeLabels. All 2 keys of MarqueeLabels are listed in the key table under the props table. |

## Example 1 of 3: Logo cloud

The list is read once by screen readers and is in the tab order once. The copies that fill the strip are hidden from both, but stay clickable. Tab to a logo that is off to the side and it glides into the middle. The Pause button sits below the strip and comes first in the tab order.

```tsx
import { Marquee } from "@/components/sheenui/marquee/marquee";
// Package build (after the first npm release, or a packed tarball): import { Marquee } from "@sheenui/theme";

const brands = [
  { name: "Acme", href: "https://example.com/acme", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><circle cx="12" cy="12" r="10" fill="currentColor" /></svg> },
  { name: "Globex", href: "https://example.com/globex", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" /></svg> },
  { name: "Initech", href: "https://example.com/initech", Logo: (props: { className?: string }) => <svg viewBox="0 0 24 24" aria-hidden {...props}><path d="M12 2l10 18H2z" fill="currentColor" /></svg> },
];

export function Example() {
  return (
    <Marquee listLabel="Customers" speed={36} gap={48}>
      {brands.map((brand) => (
        <a
          key={brand.name}
          href={brand.href}
          className="flex min-h-11 items-center gap-2 rounded-sheen-sm px-2 text-lg font-semibold text-sheen-fg-muted hover:text-sheen-fg"
        >
          <brand.Logo className="size-6" />
          {brand.name}
        </a>
      ))}
    </Marquee>
  );
}
```

## Example 2 of 3: Testimonials in glass

Level-1 glass items (tint, rim and light, no blur of their own) keep a moving strip cheap: a blurred card re-blurs its backdrop on every frame it moves, and a dozen in view would blow the glass budget. Put a blurred level (glass-2) on the items and the edges fade card by card instead, each card masked on its own glass element so its blur keeps working (a mask on the strip would switch it off). Both rows share one Pause button.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Marquee } from "@/components/sheenui/marquee/marquee";
// Package build (after the first npm release, or a packed tarball): import { Button, Marquee } from "@sheenui/theme";

const reviews = [
  { name: "Asha", text: "Best docs I have read this year." },
  { name: "Ravi", text: "Dropped into our app in an afternoon." },
  { name: "Meera", text: "The glass looks great in dark mode." },
];

function Review({ name, text }: (typeof reviews)[number]) {
  return (
    <figure>
      <blockquote className="text-sm">{text}</blockquote>
      <figcaption className="mt-2 text-xs text-sheen-fg-muted">{name}</figcaption>
    </figure>
  );
}

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Marquee
        listLabel="What people say"
        paused={paused}
        controls={false}
        itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
      >
        {reviews.map((review) => <Review key={review.name} {...review} />)}
      </Marquee>
      <Marquee
        reverse
        speed={30}
        listLabel="More reviews"
        paused={paused}
        controls={false}
        itemClassName="glass-1 w-64 self-stretch rounded-sheen-lg p-5 sm:w-72"
      >
        {reviews.map((review) => <Review key={review.name} {...review} />)}
      </Marquee>
      <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
        {paused ? "Play reviews" : "Pause reviews"}
      </Button>
    </>
  );
}
```

## Example 3 of 3: Vertical

Columns scroll at different speeds and directions. Give a vertical marquee a height; with reduced motion it keeps that height and scrolls instead.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Marquee } from "@/components/sheenui/marquee/marquee";
// Package build (after the first npm release, or a packed tarball): import { Button, Marquee } from "@sheenui/theme";

const items = ["Fast", "Accessible", "Themeable", "Typed", "Small"];

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Marquee vertical speed={28} paused={paused} controls={false} className="h-[28rem]" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
        <Marquee vertical reverse speed={22} paused={paused} controls={false} className="hidden h-[28rem] sm:flex" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
        <Marquee vertical speed={34} paused={paused} controls={false} className="hidden h-[28rem] sm:flex" itemClassName="glass-1 w-full rounded-sheen-lg p-5">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Marquee>
      </div>
      <Button variant="glass" size="sm" onClick={() => setPaused(!paused)}>
        {paused ? "Play columns" : "Pause columns"}
      </Button>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Reach the Pause / Play button first, then the real items. |
| Enter / Space | Pause or resume the strip. |

## Accessibility

- Mouse over it, or keyboard focus inside it, eases it to a stop (and back up after); focusing an off-screen item glides it into view.
- The strip has a Pause / Play button (WCAG 2.2.2). The list is rendered once for assistive tech; the repeated copies are aria-hidden and out of the tab order. listLabel names the list.
- Under reduced motion it does not move, and the copies, the edge fade and the button are dropped.

## All exports on this page

- Marquee — Marquee: an endless, seamless row (or column) of logos, testimonials, anything.
- defaultMarqueeLabels — The English MarqueeLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the marquee effect

- Use it for a Trusted by strip of customer logos below a landing page hero, or a row of short testimonials, that scrolls on its own at a steady pace.
- Use it for a review wall or testimonial rows, running two marquees in opposite directions with reverse, or a vertical column with vertical and a fixed height for a sidebar of quotes.
- Pass itemClassName with a glass class to turn every item into a glass card; the edge fade is then applied item by item so the backdrop blur keeps working.
- Skip it when the content is long, must be read carefully or contains important actions; moving content competes for attention, so use a static grid where users control the pace.
- Pair it with Avatar and Badge for testimonial cards, GlassCard for each item, and a Switch or your own button wired to the paused prop to control several marquees at once.


## Frequently asked questions

### How do I make a react marquee that never jumps?

Give Marquee children, one per item, and set speed in px per second (default 40). The list is copied as many times as needed to fill the strip, and the loop distance is one copy plus one gap, so it repeats seamlessly. gap, reverse and fade adjust spacing, direction and edges.

### Is a moving marquee accessible?

A Pause / Play button sits below the strip and comes first in the tab order, which covers WCAG 2.2.2; Enter or Space toggles it. The list is rendered once for assistive tech, named by listLabel, while the copies are aria-hidden and out of the tab order.

### How do I pause it on hover or from my own control?

Hover or keyboard focus inside eases the strip to a stop, and pauseOnHover={false} keeps it running under the mouse. For external control use paused with onPausedChange, which lets one button drive several marquees. defaultPaused starts it stopped.

### What happens with reduced motion or right-to-left layouts?

With reduced motion it does not move: a row wraps onto as many lines as it needs, a column keeps its height and scrolls, and there are no copies, fade or button. In right-to-left pages the row starts from the right and moves the other way.


## Related pages

- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)
- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)
- [Shimmer text](https://lokendra-builds.github.io/sheenui/effects/shimmer-text)
- [Spotlight card](https://lokendra-builds.github.io/sheenui/effects/spotlight-card)
- [3D tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card)
- [Typewriter](https://lokendra-builds.github.io/sheenui/effects/typewriter)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
