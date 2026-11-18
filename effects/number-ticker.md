Canonical: https://lokendra-builds.github.io/sheenui/effects/number-ticker

# Number Ticker: Animated Counter for React

URL: https://lokendra-builds.github.io/sheenui/effects/number-ticker
Sidebar name: Number ticker

A number ticker for React: an animated counter whose digits roll like an odometer. Intl formats currency, percent and locales; screen readers hear it once.

What it is: A number ticker for React where every digit is a little wheel that rolls to its new value, formatted with Intl.NumberFormat. Use it as an animated counter for KPI tiles and dashboard totals that change when a date range or filter changes, so each digit rolls to its new value like an odometer.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/number-ticker.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Number ticker

Files to copy from `theme/src/`:

- `components/number-ticker/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{canvas-effects.ts, cn.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: number-ticker. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, NumberTicker } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | required | The number to show. |
| from | number | 0 | Where the first roll starts from. Set it to value to skip the intro roll. |
| locales | Intl.LocalesArgument | the browser's | Sets the BCP 47 locale(s) for Intl.NumberFormat. |
| format | Intl.NumberFormatOptions | {} | Intl.NumberFormat options, e.g. { style: "currency", currency: "EUR" }. |
| prefix | string | optional, no default | Text before the number (read by screen readers too). |
| suffix | string | optional, no default | Text after the number (read by screen readers too). |
| animateOnView | boolean | true | Wait until the ticker is on screen before the first roll. |
| delay | number | 0 | Sets the number of seconds before the first roll. |
| duration | number | 0.6 | Seconds a roll takes, capped at 0.9 (longer values are clamped so digits are never unreadable for long). |
| trend | "auto" \| "up" \| "down" | "auto" | Which way digits roll: with the change ("auto", default), or always up / down. |
| live | "off" \| "assertive" \| "polite" | "polite" | How screen readers hear later changes: "polite" (default), "assertive", or "off" for numbers that change constantly. |

## Example 1 of 3: Live stats

Digits roll up when a value rises and down when it falls; new places slide in. Places that went through a full cycle spin an extra turn, like an odometer.

```tsx
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
// Package build (after the first npm release, or a packed tarball): import { NumberTicker } from "@sheenui/theme";

export function Example() {
  const revenue = 128400;
  const users = 18250;
  const rate = 0.043;
  const count = 42;

  return (
    <>
      <NumberTicker value={revenue} locales="en-US" format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
      <NumberTicker value={users} locales="en-US" format={{ notation: "compact", maximumFractionDigits: 1 }} />
      <NumberTicker value={rate} locales="en-US" format={{ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
      <NumberTicker value={count} from={count} locales="en-US" />
    </>
  );
}
```

## Example 2 of 3: Any locale, any numbering system

The same value through Intl.NumberFormat: separators, symbols and even the digits themselves follow the locale. In right-to-left locales the digits still read left to right, and the currency sits where the browser puts it.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, NumberTicker } from "@sheenui/theme";

const rows = [
  ["German, euro", "de-DE", { style: "currency", currency: "EUR" }, 1234567.89],
  ["Indian grouping, rupee", "en-IN", { style: "currency", currency: "INR" }, 1234567.89],
  ["Japanese, yen", "ja-JP", { style: "currency", currency: "JPY", currencyDisplay: "narrowSymbol" }, 1234567],
  ["Arabic-Indic digits", "ar-EG", {}, 1234567],
  ["Devanagari digits", "hi-IN-u-nu-deva", {}, 1234567],
  ["Compact, French", "fr-FR", { notation: "compact", compactDisplay: "long" }, 1234567],
  ["Egyptian pound, right to left", "ar-EG", { style: "currency", currency: "EGP" }, 1234567.89],
  ["Shekel, right to left", "he-IL", { style: "currency", currency: "ILS" }, 1234.5],
] as const;

export function Example() {
  return (
    <dl className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {rows.map(([label, locale, format, value]) => (
        <GlassCard key={label} level={1} sheen={false} className="flex flex-col gap-1 px-4 py-3">
          <dt className="text-xs text-sheen-fg-muted">{label}</dt>
          <dd className="text-xl font-semibold">
            <NumberTicker value={value} locales={locale} format={format} />
          </dd>
        </GlassCard>
      ))}
    </dl>
  );
}
```

## Example 3 of 3: Counts up when it comes into view

It starts from `from` (0 by default) and rolls the first time it is on screen. Pass from={value} to skip that.

```tsx
import { NumberTicker } from "@/components/sheenui/number-ticker/number-ticker";
// Package build (after the first npm release, or a packed tarball): import { NumberTicker } from "@sheenui/theme";

export function Example() {
  return (
    <p className="text-6xl font-semibold tracking-tight sm:text-7xl">
      <NumberTicker value={2400000} locales="en-US" format={{ notation: "compact" }} suffix="+" delay={0.2} />
    </p>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: this is text. |

## Accessibility

- The digit wheels are aria-hidden; the final value is in a visually hidden live region (live="polite" by default), so it is read once, correctly formatted, not digit by digit.
- Under reduced motion the value appears at once.

## When to use the number ticker effect

- Use it for the headline figure of a KPI tile or a totals row that is recalculated when someone picks another date range or filter, so the change reads as motion instead of a jump.
- Use it for a price or revenue figure with currency formatting, such as 48,250 dollars with no decimals, or a stat row on a landing page that counts up when it scrolls into view.
- Use prefix and suffix for units like a plus sign or a percent, and locales with format for compact numbers or other numbering systems; right-to-left locales are laid out correctly.
- Skip it when the number is static or updates many times a second; plain text is better, and live="off" or a non-animated figure suits values that change constantly and would spam screen readers.
- Pair it with GlassCard for a stat tile, Sparkline for the trend beside it, and SegmentedControl so switching the period makes the digits roll to the new values.


## Frequently asked questions

### How do I build a number ticker in React with currency formatting?

Pass value and a format object, for example format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}. Formatting is Intl.NumberFormat, so locales, percent, compact and unit styles all work. from sets the starting number, and setting it equal to value skips the intro roll.

### Which direction do the digits roll?

By default they roll up when the value rises and down when it falls. trend="up" or "down" forces a direction. Each digit keeps its place when the number grows or shrinks, so new places slide in instead of everything jumping, and large changes spin an extra turn.

### How do screen readers hear the changing number?

The wheels are aria-hidden, and the final value sits in a visually hidden live region, read once and correctly formatted rather than digit by digit. live defaults to "polite", can be "assertive", and "off" suits numbers that change constantly. prefix and suffix are read too.

### When does the first roll start, and what about reduced motion?

It rolls from from to value the first time it scrolls into view; animateOnView={false} rolls on mount, and delay and duration tune that first roll. With reduced motion the value simply changes with no rolling. It uses transforms and fades, with no backdrop blur.


## Related pages

- [Dashboard stats](https://lokendra-builds.github.io/sheenui/blocks/dashboard-stats)
- [Sparkbar](https://lokendra-builds.github.io/sheenui/charts/sparkbar)
- [Shimmer text](https://lokendra-builds.github.io/sheenui/effects/shimmer-text)
- [Spotlight card](https://lokendra-builds.github.io/sheenui/effects/spotlight-card)
- [3D tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card)
- [Typewriter](https://lokendra-builds.github.io/sheenui/effects/typewriter)

### Guides that cover it

- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)
- [Framer Motion Is Now Motion](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
