Canonical: https://lokendra-builds.github.io/sheenui/blocks/bento-grid

# Bento Grid for React: Glass Feature Section

URL: https://lokendra-builds.github.io/sheenui/blocks/bento-grid
Sidebar name: Bento grid

An animated bento grid for React: asymmetric glass cells with live mini-demos (charts, toasts, OTP, switches) that mount as they scroll in. Tailwind v4.

What it is: A glassmorphism bento grid for React whose cells run live mini-demos built from real SheenUI components.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/bento-grid.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Bento grid

Files to copy from `theme/src/`:

- `blocks/bento-grid.tsx`
- `components/avatar/`
- `components/badge/`
- `components/button/`
- `components/charts/{chart-utils.ts, sparkline.tsx}`
- `components/glass-card/`
- `components/otp-input/`
- `components/spinner/`
- `components/switch/`
- `blocks/bento-grid/`
- `hooks/{use-controllable.ts, use-direction.ts, use-intersection.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, light-follower.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, field-control-shell.tsx, form.ts, heading.ts, initials.ts, math.ts, motion-props.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: bento-grid. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BentoCell, BentoGrid, FeatureBento } from "@/components/sheenui/blocks/bento-grid";
import { BentoAvatarDemo, BentoChartDemo, BentoOtpDemo, BentoSwitchDemo } from "@/components/sheenui/blocks/bento-grid/demos";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BentoAvatarDemo, BentoCell, BentoChartDemo, BentoGrid, BentoOtpDemo, BentoSwitchDemo, FeatureBento } from "@sheenui/theme";
```

## FeatureBento

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | optional, no default | Section heading (ReactNode); leave out for none. |
| description | ReactNode | optional, no default | Shows text under the heading (ReactNode). |
| headingLevel | HeadingLevelOption | 2 | Heading level of title; cell titles are one level below (2 \| 3, default 2). "none" renders them all as paragraphs with no heading role (for an example). |
| labels | Partial<FeatureBentoLabels> | defaultFeatureBentoLabels | Every other string, for translation: labels={{ chartTitle: "…" }}; omitted keys keep the English of defaultFeatureBentoLabels. All 15 keys of FeatureBentoLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer <section>. |

## BentoGrid

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | Holds the cells (ReactNode, required): usually BentoCells. |
| className | string | optional, no default | Classes for the outer element (the size container). |
| gridClassName | string | optional, no default | Classes for the grid itself (gap, row height...). |

## BentoCell

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | required | Sets the cell's heading (ReactNode, required). |
| description | ReactNode | optional, no default | Shows the text under the heading (ReactNode). |
| icon | ReactNode | optional, no default | Shows a small icon before the title. |
| visual | ReactNode | optional, no default | Live preview or artwork. Mounted the first time the cell scrolls into view. |
| colSpan | 2 \| 1 \| 3 | 1 | Columns spanned on the widest grid (3 columns); spans shrink with the grid. |
| rowSpan | 2 \| 1 | 1 | Sets how many rows the cell spans from 2 columns up. |
| orientation | "horizontal" \| "vertical" | "vertical" | "horizontal" puts the text beside the visual once the cell is wide enough. |
| href | string | optional, no default | Adds a "learn more" link under the description. |
| cta | string | "Learn more" | Text of the link (string, default "Learn more"). |
| index | number | 0 | Sets the position in the grid: staggers the entrance. |
| headingLevel | HeadingLevelOption | 3 | Heading level of the title (1 to 6, default 3), or "none" for a paragraph with no heading role (for an example). |
| className | string | optional, no default | Adds extra classes to the glass card (string). |
| visualClassName | string | optional, no default | Adds extra classes to the visual area. |

## Demos

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| BentoChartDemo | { data?, currency?, locale?, labels? } | optional, no default | Sparkline with a period picker and a count-up total. data maps a period key ("7d") to { total, change, values }. |
| BentoToastDemo | { notifications?, labels? } | optional, no default | Three toasts arrive on their own, then a button sends more. Hover, focus or tap fans the stack out. |
| BentoOtpDemo | { code?, labels? } | "2468" | OTP field that verifies against code and shakes on a miss. |
| BentoSwitchDemo | { labels? } | optional, no default | Switches that frost, tint and float a glass tile over crisp shapes. |
| BentoAvatarDemo | { people?, extra?, labels? } | optional, no default | Avatar group with presence and an invite button; extra shows a “+N” chip. |
| useBentoCellVisible | () => boolean | optional, no default | Inside a cell: false while it is off screen, so your own loops can pause. |

## BentoAvatarDemo props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| people | string[] | ["Maya Chen", "Leo Park", "Ava Singh", "Noah Kim", "Iris Patel", "Omar Haddad"] | Names of the people who can join (string[], default: sample names). |
| extra | number | 12 | People beyond the list, shown as "+N" (number, default 12). |
| labels | Partial<BentoAvatarLabels> | defaultBentoAvatarLabels | Every other string, for translation: labels={{ invite: "…" }}; omitted keys keep the English of defaultBentoAvatarLabels. All 5 keys of BentoAvatarLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BentoChartDemo props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | Record<string, BentoChartPeriod> | defaultChartData (The default per-period series of the chart tile) | Figures per period (Record<string, BentoChartPeriod>, default: sample revenue); the keys become the period buttons. |
| currency | string | "USD" | Sets the ISO 4217 currency (string, default "USD"). |
| locale | string | "en-US" | Sets the BCP 47 locale (string, default "en-US"). |
| labels | Partial<BentoChartLabels> | defaultBentoChartLabels | Every other string, for translation: labels={{ metric: "…" }}; omitted keys keep the English of defaultBentoChartLabels. All 6 keys of BentoChartLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BentoOtpDemo props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| code | string | "2468" | The code that verifies (string, default "2468"). Its length sets the number of slots. |
| labels | Partial<BentoOtpLabels> | defaultBentoOtpLabels | Every other string, for translation: labels={{ label: "…" }}; omitted keys keep the English of defaultBentoOtpLabels. All 5 keys of BentoOtpLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BentoSwitchDemo props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<BentoSwitchLabels> | defaultBentoSwitchLabels | Every other string, for translation: labels={{ preview: "…" }}; omitted keys keep the English of defaultBentoSwitchLabels. All 5 keys of BentoSwitchLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## BentoToastDemo props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| notifications | BentoToast[] | defaultToasts (The default notifications of the toast-stack tile) | Notifications to cycle through. The first three play on their own when the cell appears. |
| labels | Partial<BentoToastLabels> | defaultBentoToastLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultBentoToastLabels. All 2 keys of BentoToastLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Feature bento

The ready-made block. Every cell is interactive: pick a period, hover or focus the toasts to fan them out, type 2468, flip the switches, invite a teammate.

```tsx
import { FeatureBento } from "@/components/sheenui/blocks/bento-grid";
// Package build (after the first npm release, or a packed tarball): import { FeatureBento } from "@sheenui/theme";

<FeatureBento
  title="Everything you need, already moving"
  description="Live components, not screenshots. Try them."
/>
```

## Example 2 of 2: Compose your own

BentoGrid lays cells out by its own width (1, 2, then 3 columns); spans shrink with it, so nothing overflows. Put any visual in a cell, built-in demos included.

```tsx
import { BentoGrid, BentoCell } from "@/components/sheenui/blocks/bento-grid";
import { BentoChartDemo, BentoOtpDemo, BentoSwitchDemo, BentoAvatarDemo } from "@/components/sheenui/blocks/bento-grid/demos";
// Package build (after the first npm release, or a packed tarball): import { BentoGrid, BentoCell, BentoChartDemo, BentoOtpDemo, BentoSwitchDemo, BentoAvatarDemo } from "@sheenui/theme";

<BentoGrid>
  <BentoCell index={0} colSpan={2} title="Revenue at a glance" description="…" visual={<BentoChartDemo />} href="#demo-analytics" cta="Open analytics" />
  <BentoCell index={1} title="Passwordless" description="…" visual={<BentoOtpDemo code="1357" />} />
  <BentoCell index={2} title="Tune the glass" visual={<BentoSwitchDemo />} />
  <BentoCell index={3} title="Your team, live" visual={<BentoAvatarDemo />} />
  <BentoCell index={4} title="Any visual" visual={<img src="/artwork.svg" alt="" className="size-full object-cover" />} />
</BentoGrid>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Visit the controls inside each demo cell in reading order; a cell's optional link is the only tab stop the cell itself adds. |
| Space | Toggle a switch in the switch demo. |
| 0–9 / Backspace | Type or step back in the OTP demo; “Try again” is a button. |

## Accessibility

- BentoGrid is a plain layout <div> with no semantics; each cell carries its own heading and text.
- The avatar group has a text name and “+N” has a long form for screen readers; changes are announced.
- The switch demo uses real switches with visible labels.

## All exports on this page

- BentoAvatarDemo — A bento visual: an avatar group where an "Invite teammate" button adds people one by one and a sentence says who is editing.
- BentoCell — Use it inside a BentoGrid.
- BentoChartDemo — A bento visual: a revenue total that counts up beside a sparkline, with period buttons that change both.
- BentoGrid — Props (see BentoGridProps): children (required), className (the size container) and gridClassName (the grid itself: gap, row height).
- BentoOtpDemo — A bento visual: a working one-time-code field with a hint, a success state and a wrong-code shake.
- BentoSwitchDemo — A bento visual: three switches (frosted glass, accent tint, float) that change a live glass tile over coloured shapes, so the blur is easy to see.
- BentoToastDemo — A bento visual: a stack of glass notifications that plays three on its own, spreads on hover or focus, and has a button to send another.
- FeatureBento — The ready-made feature section: a heading and a BentoGrid of cells, each with a live mini-demo (chart, toasts, OTP, switches, avatars).
- defaultBentoAvatarLabels — The English strings of the avatar tile; pass labels to override any of them.
- defaultBentoChartLabels — The English strings of the chart tile; pass labels to override any of them.
- defaultBentoOtpLabels — The English strings of the one-time-code tile; pass labels to override any of them.
- defaultBentoSwitchLabels — The English strings of the glass-switch tile; pass labels to override any of them.
- defaultBentoToastLabels — The English strings of the toast tile; pass labels to override any of them.
- defaultFeatureBentoLabels — The English strings of FeatureBento; pass labels to override any of them.
- useBentoCellVisible — True while the surrounding BentoCell is on screen: pause loops and timers when it's false.


## When to use the bento grid

- Use BentoGrid as a glassmorphism bento grid for a landing page feature section, where cells of different sizes show a chart, a notification stack, an OTP field and a switch preview instead of a plain three-column list. Use it as a bento features section in Tailwind on a landing page.
- Use it for a product overview inside a documentation site, giving big cells colSpan 2 or rowSpan 2 and letting the grid collapse to one column on narrow containers.
- Use BentoCell with a visual prop to mount heavy demos lazily, since the visual only appears the first time its cell scrolls into view.
- Skip it when the items are uniform records that people scan or sort, such as team members or invoices; a simple card grid or a data table is clearer than a bento layout.
- Pair it with Sparkline, Avatar, Badge and Switch inside cells, and with the ready-made BentoChartDemo, BentoToastDemo and BentoOtpDemo visuals when you want a quick start.


## Frequently asked questions

### How do I make a bento grid in React with BentoGrid and BentoCell?

Wrap BentoCell children in BentoGrid. Each cell takes a required title, plus description, icon, visual, colSpan, rowSpan, href and cta. Use className for the container and gridClassName for gap and row height. The cells carry their own headings, and the grid adds no semantics.

### How many columns does the grid use on small screens?

It follows its own width, not the viewport: one column by default, two from 36rem and three from 56rem. Cell spans shrink on the way down so nothing overflows. That means a grid placed in a narrow sidebar also stacks correctly without media queries on your side.

### Does a bento cell load its visual before the user scrolls to it?

No. The visual prop is mounted the first time the cell scrolls into view, so cells nobody reaches cost nothing. Decorative visuals should be aria-hidden. The card itself rises in with a stagger set by index, and reduced motion only fades.

### Which keyboard stops does a bento cell add?

Only the optional link. When you pass href and cta, that link is the single tab stop the cell adds. The demo visuals have their own controls: the chart's period pills are a radio group with arrow-key navigation, and the switch demo uses Space to toggle each switch.


## Related pages

- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Spotlight card](https://lokendra-builds.github.io/sheenui/effects/spotlight-card)
- [Chat app](https://lokendra-builds.github.io/sheenui/blocks/chat-app)
- [Notification center](https://lokendra-builds.github.io/sheenui/blocks/notification-center)
- [Pricing](https://lokendra-builds.github.io/sheenui/blocks/pricing)
- [Settings page](https://lokendra-builds.github.io/sheenui/blocks/settings-page)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
