Canonical: https://lokendra-builds.github.io/sheenui/components/skeleton

# React Skeleton Loader with Shimmer Effect

URL: https://lokendra-builds.github.io/sheenui/components/skeleton
Sidebar name: Skeleton

Glass skeleton loaders for React that hold the exact layout while content loads, with one shimmer beam per group. Reduced-motion safe. Tailwind CSS v4.

What it is: A glass React skeleton loader that holds the exact layout while content loads, so nothing jumps when it arrives.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/skeleton.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Skeleton

Files to copy from `theme/src/`:

- `components/skeleton/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: skeleton. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Skeleton, SkeletonCard, SkeletonCircle, SkeletonGroup, SkeletonList, SkeletonRect, SkeletonText } from "@/components/sheenui/skeleton/skeleton";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Skeleton, SkeletonCard, SkeletonCircle, SkeletonGroup, SkeletonList, SkeletonRect, SkeletonText } from "@sheenui/theme";
```

## Skeleton

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| shape | "circle" \| "rect" \| "text" \| "pill" | "rect" | rect (rounded box, default), text (one line), pill (button / chip), circle (avatar). |
| width | string \| number | optional, no default | CSS width: a number is px, a string is used as is ("60%", "12rem"). |
| height | string \| number | their width | CSS height: a number is px, a string is used as is. Circles default to their width. |
| shimmer | boolean | true | Sweep of light across the shape. Never drawn under reduced motion. |

## SkeletonText

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| lines | number | 3 | Number of lines (0 renders none). |
| size | "sm" \| "md" \| "lg" \| "heading" \| "xs" | "md" | Matches the text it stands in for: xs 12px … lg 18px body text, or a heading. |
| lastLineWidth | string | "62%" | Width of the last line (it is usually shorter). |
| shimmer | boolean | true | Sets the sweep of light across the lines. |
| labels | Partial<SkeletonLabels> | defaultSkeletonLabels | When labels.loading is set, the block announces itself as a loading region (role="status"). Every other string, for translation: labels={{ loading: "…" }}; omitted keys keep the English of defaultSkeletonLabels. Its only key is listed in the key table under the props table. |

## SkeletonCard / SkeletonList

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| media | boolean | true | Shows a 16:9 media block on top. |
| avatar | boolean | true | An avatar with a name and a meta line. |
| lines | number | 3 | Sets the number of body text lines (14px text; 0 for none). |
| actions | number | 2 | Number of pill buttons in the footer, sized like small buttons (0 for none). |
| surface | "glass" \| "plain" | "glass" | glass: its own glass card (default). plain: shapes only, to drop into your own card. |
| shimmer | boolean | true | Sets the sweep of light across the shapes. |
| labels | Partial<SkeletonLabels> | defaultSkeletonLabels | Spoken text: labels.loading is heard while loading (null when an outer SkeletonGroup already announces it). Every other string, for translation: labels={{ loading: "…" }}; omitted keys keep the English of defaultSkeletonLabels. Its only key is listed in the key table under the props table. |
| rows | number | 4 | Number of rows (0 renders none). |
| trailing | boolean | true | A trailing pill (a status badge or button) at the end of each row. |

## SkeletonGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<SkeletonLabels> | defaultSkeletonLabels | Spoken text. labels.loading is what screen readers hear while this region loads (null when an outer region already announces it). Every other string, for translation: labels={{ loading: "…" }}; omitted keys keep the English of defaultSkeletonLabels. Its only key is listed in the key table under the props table. |

## SkeletonCircle props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| shimmer | boolean | true | Sweep of light across the shape. Never drawn under reduced motion. |
| size | "sm" \| "md" \| "lg" \| "xl" \| "xs" | "md" | Sets the size: xs 24 · sm 32 · md 40 (default) · lg 48 · xl 64 px. |

## SkeletonRect props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| height | string \| number | their width | CSS height: a number is px, a string is used as is. Circles default to their width. |
| width | string \| number | "100%" | CSS width: a number is px, a string is used as is ("60%", "12rem"). |
| shimmer | boolean | true | Sweep of light across the shape. Never drawn under reduced motion. |
| ratio | string | optional, no default | CSS aspect ratio, e.g. "16 / 9" (media) or "1" (square). Ignored when height is set. |

## Example 1 of 2: Presets

SkeletonCard and SkeletonList match a real card and list line for line: text skeletons use the same line boxes as the text (20px for 14px text), so nothing jumps when the content arrives. Each preset is one named loading region, never one label per line.

```tsx
import { SkeletonCard, SkeletonList } from "@/components/sheenui/skeleton/skeleton";
// Package build (after the first npm release, or a packed tarball): import { SkeletonCard, SkeletonList } from "@sheenui/theme";

export function Example({ loading }: { loading: boolean }) {
  return (
    <>
      {loading ? <SkeletonCard labels={{ loading: "Loading article" }} /> : <article>Your article card</article>}
      {loading ? <SkeletonList rows={4} labels={{ loading: "Loading activity" }} /> : <ul>Your activity list</ul>}
    </>
  );
}
```

## Example 2 of 2: Building blocks

Compose your own from Skeleton (rect, text, pill, circle), SkeletonText, SkeletonCircle and SkeletonRect. Wrap them in SkeletonGroup: it names the loading region once, and one beam of light crosses the whole group, every shape in step wherever it sits.

```tsx
import { Skeleton, SkeletonCircle, SkeletonGroup, SkeletonRect, SkeletonText } from "@/components/sheenui/skeleton/skeleton";
// Package build (after the first npm release, or a packed tarball): import { Skeleton, SkeletonCircle, SkeletonGroup, SkeletonRect, SkeletonText } from "@sheenui/theme";

export function Example() {
  return (
    <SkeletonGroup labels={{ loading: "Loading profile" }} className="glass-2 rounded-sheen-lg p-6">
      <div className="flex items-center gap-4">
        <SkeletonCircle size="xl" />
        <div className="flex flex-1 flex-col gap-3">
          <SkeletonText size="heading" lines={1} />
          <Skeleton shape="text" width="40%" />
        </div>
        <Skeleton shape="pill" width={96} />
      </div>
      <SkeletonRect height={140} className="mt-6" />
      <SkeletonText lines={2} size="sm" className="mt-5" />
    </SkeletonGroup>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: skeletons are not focusable. |

## Accessibility

- Shapes are aria-hidden. Wrap a loading region in SkeletonGroup, or give a preset its own label, so screen readers hear one polite "Loading…" instead of nothing.
- Remove the skeleton (and the status) as soon as content arrives so the real content is announced in its place.
- The live demos on this page pass role="none": a skeleton that is already on screen when the page loads should not be announced. Keep the status role for a skeleton that appears after a user action.
- One shared shimmer beam; it does not run under reduced motion.

## All exports on this page

- Skeleton — Skeleton: one placeholder shape that holds the layout while content loads.
- SkeletonCard — A content card preset: media, author row, text and actions, in a SkeletonGroup.
- SkeletonCircle — An avatar or icon placeholder: a Skeleton circle.
- SkeletonGroup — Wraps skeleton shapes: a named loading region (role="status" with a visually hidden label) and the box the shimmer sweeps across in one beam.
- SkeletonList — Rows of a list, inbox or table: avatar, two lines, a trailing pill, in a SkeletonGroup.
- SkeletonRect — A box: media, a chart, a thumbnail.
- SkeletonText — Lines of text.
- defaultSkeletonLabels — English defaults of SkeletonLabels.


## When to use Skeleton

- Use SkeletonCard as a skeleton loading state while a product or article card loads, so the 16:9 media block, avatar, text lines and button pills occupy the same space as the real card and nothing jumps.
- Use SkeletonList for an inbox, a user table or a settings list, where each row has an avatar, two text lines and a trailing pill, and rows count is set to match the page size.
- Compose your own layout from Skeleton shapes inside SkeletonGroup for a dashboard widget, so one beam of light crosses every shape in step and the region is named once.
- Skip it for tiny waits or actions that start from a click; Spinner suits a button or inline wait, and Empty state is the right component once loading has finished with no data.
- Pair it with GlassCard for the final content, Avatar for the loaded profile, and a persistent status region if you want a reliable spoken Loaded message.


## Frequently asked questions

### How do I build a react skeleton loader that matches my layout?

Use the presets SkeletonCard and SkeletonList, or compose Skeleton with shape rect, text, pill or circle, plus SkeletonText, SkeletonCircle and SkeletonRect. Text skeletons use the same line box as the real text, 20px for 14px text, so the content does not shift when it arrives.

### How do screen readers know something is loading?

Shapes are aria-hidden. Wrap a region in SkeletonGroup, or give a preset its own label, and it becomes a role="status" region that says Loading politely, once. Pass label={null} on a preset inside a group so it is not announced twice, and remove the skeleton when content arrives.

### Does the shimmer run for users who prefer reduced motion?

No. The sweep of light is never drawn under reduced motion, so the shapes are simply still. Otherwise one band crosses a whole group in a single beam using transform only. Set shimmer={false} on a Skeleton, SkeletonText or a preset to turn the sweep off yourself.

### How do I size the placeholders?

Skeleton takes width and height as numbers in px or as strings such as "60%"; a circle's height defaults to its width. SkeletonText takes lines, 3 by default, size from xs to heading, and lastLineWidth, 62% by default. Use className, such as h-4 or rounded-sheen-lg, for the rest.


## Related pages

- [Carousel](https://lokendra-builds.github.io/sheenui/components/carousel)
- [Code block](https://lokendra-builds.github.io/sheenui/components/code-block)
- [Empty state](https://lokendra-builds.github.io/sheenui/components/empty-state)
- [Meter](https://lokendra-builds.github.io/sheenui/components/meter)
- [Table](https://lokendra-builds.github.io/sheenui/components/table)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
