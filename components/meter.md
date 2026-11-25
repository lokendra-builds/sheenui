Canonical: https://lokendra-builds.github.io/sheenui/components/meter

# React Meter: Usage, Quota & Password Strength

URL: https://lokendra-builds.github.io/sheenui/components/meter
Sidebar name: Meter

A glass React meter for levels in a known range: storage, battery, signal or password strength. Green, amber or red by HTML meter rules. Base UI, MIT.

What it is: A glass React meter for a level inside a known range, such as storage, battery or password strength, that is spoken as well as colored.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/meter.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Meter

Files to copy from `theme/src/`:

- `components/meter/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, math.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: meter. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Meter } from "@/components/sheenui/meter/meter";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Meter } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| max | number | 100 | Largest value of the scale; a value above it is clamped. |
| min | number | 0 | Smallest value of the scale; a value below it is clamped. |
| label | ReactNode | optional, no default | Visible label (also the meter's accessible name). Without it, pass aria-label. |
| description | ReactNode | optional, no default | Help text under the bar, e.g. "4.2 GB of 16 GB used". Linked with aria-describedby. |
| low | number | optional, no default | Upper bound of the low region. With high, enables good / warning / critical colouring. |
| high | number | optional, no default | Sets the lower bound of the high region. |
| optimum | number | the middle of the range (HTML <meter> rules) | Sets where the best value lies. |
| valueText | ReactNode \| ((formatted: string, value: number) => ReactNode) | Base UI's formatted value | The value text on the right: Base UI's formatted value (percentage of the range, or format applied to the value). A function receives (formatted, value). false hides it. |
| showLevel | boolean | false | Write the level ("Good", "Warning", "Critical") next to the value. |
| levelLabels | Partial<Record<MeterLevel, string>> | optional, no default | Words for each level (spoken in aria-valuetext, shown with showLevel). |
| variant | "bar" \| "segmented" | "bar" | bar (default): one continuous fill. segmented: a row of cells, like a battery or signal meter. |
| segments | number | 10 | Sets the number of cells for the segmented variant. |
| size | "sm" \| "md" \| "lg" | "md" | Thickness of the bar: "sm" (6px), "md" (10px, default) or "lg" (16px). |
| showThresholds | boolean | on for the bar variant | Small ruler ticks under the bar at low and high. |
| className | string | optional, no default | Adds extra classes to the outer element. |
| value | number | required | Required. Clamped to [min, max] (NaN falls back to min). |
| format / locale | Intl.NumberFormatOptions / string | optional, no default | Number formatting (Intl), also used for aria-valuetext. |
| getAriaValueText | (formatted, value) => string | optional, no default | Gives full control over the spoken value. |

## Example 1 of 2: Levels

Storage: lower is better (optimum 0), so it goes amber past 70% and red past 90%. Battery: higher is better. CPU updates live; the fill springs and the number counts with it.

```tsx
import { Meter } from "@/components/sheenui/meter/meter";
// Package build (after the first npm release, or a packed tarball): import { Meter } from "@sheenui/theme";

export function Example() {
  const storage = 82; // percent used
  const cpu = 41;

  return (
    <>
      <Meter label="Storage" value={storage} low={70} high={90} optimum={0} showLevel
        description={`${(storage * 0.64).toFixed(1)} GB of 64 GB used`} />
      <Meter label="Battery" value={18} low={20} high={60} optimum={100} showLevel />
      <Meter label="CPU" value={cpu} low={60} high={85} optimum={0} size="sm" />
    </>
  );
}
```

## Example 2 of 2: Segmented and custom values

variant=segmented draws cells, like a battery or signal meter. format / valueText change the number; levelLabels rename the levels.

```tsx
import { Meter } from "@/components/sheenui/meter/meter";
// Package build (after the first npm release, or a packed tarball): import { Meter } from "@sheenui/theme";

export function Example() {
  const strength = 60; // 0 to 100, from your password checker

  return (
    <>
      <Meter
        label="Password strength"
        value={strength}
        low={40}
        high={75}
        optimum={100}
        variant="segmented"
        segments={4}
        showLevel
        valueText={false}
        levelLabels={{ critical: "Weak", suboptimal: "Fair", optimum: "Strong" }}
      />
      <Meter label="Bandwidth" value={7.4} max={10} format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }} />
      <Meter label="Signal" value={3} max={5} variant="segmented" segments={5} valueText={(_, v) => `${v} of 5 bars`} />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a meter is a read-out, not a control. |

## Accessibility

- role="meter" named by label (or aria-label), described by description, with aria-valuenow, aria-valuemin and aria-valuemax.
- The level (critical, suboptimal, optimum) is part of the spoken value (aria-valuetext) and, with showLevel, written next to the value, so color is never the only signal.
- Use variant="segmented" for battery- or signal-style read-outs; the same spoken value applies.

## All exports on this page

- Meter — Meter: a measurement within a known range (disk usage, battery, password strength, CPU load).
- defaultMeterLevelLabels — Default words for each MeterLevel (Good, Warning, Critical).
- getMeterLevel — Which region the value falls in, by the HTML <meter> algorithm.


## When to use Meter

- Use it as a storage usage bar, such as 41 GB of 64 GB, where lower is better and the bar turns amber past 70 percent and red past 90 percent using low, high and optimum.
- Use it for a battery or signal read-out with variant="segmented", which draws cells like a battery icon, and for password strength with levelLabels renamed to Weak and Strong.
- Use it for a live value such as CPU load, where the fill springs to the new level and the number counts with it.
- Skip it when the value shows progress toward completion of a task; Progress is the right component for uploads and steps, because a meter describes a level in a range rather than how far along something is.
- Pair it with Badge to repeat the level in words, Tooltip for the exact value, and GlassCard to group several meters in a dashboard.


## Frequently asked questions

### What is the difference between a react meter and a progress bar?

A meter shows a level in a known range, such as disk usage or battery, and can change color by region. A progress bar shows how far a task has come. This Meter is built on Base UI's Meter and exposes role="meter" with aria-valuenow, aria-valuemin and aria-valuemax.

### How do the low, high and optimum props color the bar?

They follow the HTML meter element's rules. With low or high set, the fill is colored by level: green for optimum, amber for suboptimal, red for critical. optimum says where the best value lies, so storage with optimum 0 stays green up to low, turns amber between low and high, and goes red past high, while a battery with optimum at the maximum is the reverse.

### Is color the only signal for the level?

No. The level is part of the spoken aria-valuetext, and showLevel also writes it next to the value. Rename the words through levelLabels, Good, Warning and Critical by default, or take full control with getAriaValueText. A meter is a read-out and is not focusable.

### How do I change how the value is displayed?

valueText takes a node or a function of the formatted value and the number, and false hides it. format accepts Intl.NumberFormatOptions and locale picks the language, and both feed aria-valuetext. Add label for the visible name and description for help text linked by aria-describedby.


## Related pages

- [Table](https://lokendra-builds.github.io/sheenui/components/table)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)
- [Carousel](https://lokendra-builds.github.io/sheenui/components/carousel)
- [Code block](https://lokendra-builds.github.io/sheenui/components/code-block)
- [Empty state](https://lokendra-builds.github.io/sheenui/components/empty-state)

### Guides that cover it

- [Accessible React Charts](https://lokendra-builds.github.io/sheenui/guides/accessible-react-charts)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
