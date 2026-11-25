Canonical: https://lokendra-builds.github.io/sheenui/components/progress

# Animated React Progress Bar (Indeterminate Too)

URL: https://lokendra-builds.github.io/sheenui/components/progress
Sidebar name: Progress

A glass React progress bar with an accent fill and a slow sweep of light. Pass null for an indeterminate loading bar. Accessible, Tailwind CSS v4, MIT.

What it is: A glass React progress bar with an accent fill and a sweep of light, plus an indeterminate mode for loading states.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/progress.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Progress

Files to copy from `theme/src/`:

- `components/progress/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: progress. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Progress } from "@/components/sheenui/progress/progress";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Progress } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| value | number \| null | required | A number from 0 to max. Pass null for an indeterminate (loading) bar. |
| max | number | 100 | The value that means "done" (value is read against it). |
| label | ReactNode | optional, no default | Text above the bar, also its accessible name. |
| showValue | boolean | true | Show the percentage on the right. |
| locale | Intl.LocalesArgument | the browser's | Sets the BCP 47 locale of the percentage ("18%" or "18 %"). |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Determinate and indeterminate

```tsx
import { Progress } from "@/components/sheenui/progress/progress";
// Package build (after the first npm release, or a packed tarball): import { Progress } from "@sheenui/theme";

export function Example() {
  const value = 64; // 0 to 100

  return (
    <>
      <Progress label="Uploading design.fig" value={value} />
      <Progress label="Preparing export" value={null} />
    </>
  );
}
```

## Example 2 of 2: Several tasks with labels

Each bar has its own name. The value is read to screen readers; showValue also prints it.

```tsx
import { Progress } from "@/components/sheenui/progress/progress";
// Package build (after the first npm release, or a packed tarball): import { Progress } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Progress label="Photos" value={100} />
      <Progress label="Videos" value={42} />
      <Progress label="Documents" value={7} showValue={false} />
      <Progress label="Waiting for the server" value={null} />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: Progress is a read-out, not a control. |

## Accessibility

- Base UI renders role="progressbar" with aria-valuenow, aria-valuemin and aria-valuemax; label names it.
- value={null} is indeterminate: no aria-valuenow, so it is announced as busy rather than as a percentage.
- The track and fill keep 3:1 contrast against the surface. Under reduced motion the fill jumps to each new value and the indeterminate bar becomes a still, half-tone bar.

## When to use Progress

- Use Progress as an animated progress bar for a file upload or an import job where the total is known, showing the percentage on the right and a label like Uploading report.pdf above the bar.
- Use it for a multi-step setup wizard, passing value and a max equal to the number of steps so the bar fills as each step completes.
- Use value null for an indeterminate bar while a request has no known length, which Base UI exposes without aria-valuenow so screen readers do not read a false number.
- Skip it when the number is a measurement against a range, such as disk space or password strength, where Meter fits. Use Spinner for tiny waits and Skeleton for content shapes.
- Pair it with Button to start or cancel the task, Toast for completion, and DataTable progress cells to show per-row status in a long list.


## Frequently asked questions

### How do I make a React progress bar with SheenUI?

Render Progress with a value from 0 to max, which defaults to 100 so value reads as a percentage. Add a label, which also names the bar for assistive technology. Set showValue to false to hide the percentage, and pass locale for prerendered pages so server and browser text match.

### What does an indeterminate progress bar look like?

Pass value as null. The bar slides to signal loading with no known end, and Base UI omits aria-valuenow, aria-valuemin and aria-valuemax in that state. Under reduced motion it becomes a static, half-tone full-width bar instead of sliding.

### How does it animate between values?

The fill is a full-width bar moved with translateX, transform only, so the rounded leading edge never distorts and the track clips it. A light sweeps across the fill a few times after each change. With reduced motion the fill jumps straight to each new value.

### Is the progress bar focusable?

No. It is a read-out with role progressbar, so it takes no tab stop. Base UI supplies aria-valuenow, min and max for determinate values, and the label provides the name. Forced colors keep the fill visible, and the percentage is formatted in the locale you pass.

### When should I use Progress, Meter or Spinner?

Use Progress for a task with a known length, such as an upload or a setup wizard, and pass value={null} while the length is unknown. Use Meter for a measurement against a range, such as disk used or password strength. A Spinner says that something is busy without saying how far along it is.

### Can I hide the percentage or translate it?

Yes. showValue turns the percentage text on or off, and the number is formatted in the locale prop. label names the bar for assistive tech: Base UI renders role="progressbar" with aria-valuenow, aria-valuemin and aria-valuemax, and leaves all three out while the value is null.


## Related pages

- [Meter](https://lokendra-builds.github.io/sheenui/components/meter)
- [Bullet chart](https://lokendra-builds.github.io/sheenui/charts/bullet-chart)
- [Select](https://lokendra-builds.github.io/sheenui/components/select)
- [Slider](https://lokendra-builds.github.io/sheenui/components/slider)
- [Switch](https://lokendra-builds.github.io/sheenui/components/switch)
- [Spinner](https://lokendra-builds.github.io/sheenui/components/spinner)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
