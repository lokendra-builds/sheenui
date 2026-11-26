Canonical: https://lokendra-builds.github.io/sheenui/components/glass-card

# Glassmorphism Card Component for React & Tailwind

URL: https://lokendra-builds.github.io/sheenui/components/glass-card
Sidebar name: Glass card

A glassmorphism card for React and Tailwind CSS v4: three frosted glass levels, a pointer-following sheen and a solid fallback for reduced transparency.

What it is: The glassmorphism card is SheenUI's basic frosted-glass surface for React: pick one of three blur levels, and a soft highlight follows the pointer.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Glass card

Files to copy from `theme/src/`:

- `components/glass-card/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/light-follower.ts`
- `lib/{cn.ts, heading.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: glass-card. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from "@/components/sheenui/glass-card/glass-card";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| level | 2 \| 1 \| 3 | 2 | 1 = subtle (chips), 2 = cards (default), 3 = most opaque (dialogs, bars). |
| sheen | boolean | true | Soft highlight that follows the pointer (mouse and pen only). |
| tint | boolean | false | Tints the surface with the accent for featured content. |
| interactive | boolean | false | Lifts slightly on hover; use for clickable cards. Movement is off with reduced motion. |

## GlassCardTitle props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| headingLevel | HeadingLevelOption | 3 | Heading level ("none" renders a paragraph with the same look). |

## Example 1 of 2: Card with header, content and footer

Everything your team needs to ship.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { Button, GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="w-full max-w-sm">
      <GlassCardHeader>
        <GlassCardTitle>Team plan</GlassCardTitle>
        <GlassCardDescription>Everything your team needs to ship.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-4xl font-semibold">$29<span className="text-sm">/mo</span></p>
      </GlassCardContent>
      <GlassCardFooter>
        <Button fullWidth>Upgrade</Button>
      </GlassCardFooter>
    </GlassCard>
  );
}
```

## Example 2 of 2: Levels, tint and interactive

Interactive cards lift on hover; tinted cards carry a hint of the accent color.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { GlassCard } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <GlassCard level={1} className="p-5">Level 1</GlassCard>
      <GlassCard level={2} interactive className="p-5">Level 2 · interactive</GlassCard>
      <GlassCard level={3} tint className="p-5">Level 3 · tint</GlassCard>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a plain card is not interactive. Buttons and links inside it keep their own tab stops. For a clickable card give it role="link" or role="button" and a tabIndex. |

## Accessibility

- Plain markup with no role, so reading order is the DOM order.
- Glass levels keep text at 4.5:1 over any backdrop; reduced transparency makes the card opaque, and forced colors give it a real border.
- The sheen is a soft highlight that follows a mouse or pen (never on touch). The hover lift is off with reduced motion.

## When to use the glass card

- Use GlassCard as a glassmorphism card for the tiles on a dashboard or pricing page, where grouped content sits on a gradient or photo background and the frosted surface keeps text readable.
- Use the tint prop to mark a featured plan or highlighted stat, so one card among several reads as accent colored without writing custom styles.
- Use interactive for a clickable card in a project grid, adding role, tabIndex and key handlers yourself, so it lifts on hover and shows a solid focus ring.
- Skip it when you need the full refracting lens look, which LiquidGlass provides, or when a page has more than a handful of cards in view, since each is a backdrop-filter surface.
- Pair it with Badge and Button in the footer, Avatar in the header, and Progress or NumberTicker in the content area for stat cards.


## Frequently asked questions

### How do I create a glassmorphism card in React?

Render GlassCard and compose GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent and GlassCardFooter inside it. It is a div with backdrop blur, and level 1, 2 or 3 sets how opaque the glass is, from chips and cards to dialogs and bars. Level 2 is the default.

### Does the card have a performance limit?

Each GlassCard is one backdrop-filter surface, and the source states a budget of at most 8 in view at once. Past that, use fewer glass surfaces or plain containers for inner content. Reduced transparency makes the card opaque, and forced colors give it a solid border and background.

### What does the sheen prop do?

It adds a soft highlight that follows the pointer, on by default. It only reacts to mouse and pen, never touch, and it stays at rest with reduced motion. Set sheen to false to turn it off. The light moves with a composited translate, so the card is not repainted on each move.

### Is a GlassCard focusable?

Not on its own. It has no role, so a plain card is just a group of content. For a clickable card, give it role link or button with tabIndex 0 and key handlers; interactive then draws a solid focus ring. Every div prop, including onClick and className, is accepted.


## Related pages

- [Spotlight card](https://lokendra-builds.github.io/sheenui/effects/spotlight-card)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [3D tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [OTP input](https://lokendra-builds.github.io/sheenui/components/otp-input)
- [Popover](https://lokendra-builds.github.io/sheenui/components/popover)

### Guides that cover it

- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)
- [Apple Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react)
- [Accessible Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)
- [Glassmorphism vs Liquid Glass vs Neumorphism](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-vs-liquid-glass)
- [backdrop-filter Performance: Fast Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)
- [Best Glassmorphism React Libraries (2026)](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries)
- [shadcn Alternatives with Animation: Nine Libraries Compared (2026)](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives)
- [shadcn Glassmorphism: Three Ways to Get a Glass UI](https://lokendra-builds.github.io/sheenui/guides/shadcn-glassmorphism)
- [Glassmorphism UI Prompts for AI Coding Agents](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
