Canonical: https://lokendra-builds.github.io/sheenui/layout/resizable

# React Resizable Panels with Keyboard Handles

URL: https://lokendra-builds.github.io/sheenui/layout/resizable
Sidebar name: Resizable panels

Resizable panels for React with draggable, keyboard-accessible handles, min and max sizes and nesting. ARIA window splitter, Tailwind CSS v4, MIT.

What it is: Resizable panels for React split a layout into regions with draggable, keyboard-resizable handles, size limits and nested groups. Use Resizable panels for workspaces where people choose how much room each area gets: a file tree beside an editor, a list beside a detail pane, a console under a canvas.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/resizable.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Resizable panels

Files to copy from `theme/src/`:

- `components/resizable/`
- `hooks/{use-direction.ts, use-latest.ts}`
- `lib/{cn.ts, form.ts, math.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: resizable. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Progress } from "@/components/sheenui/progress/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/sheenui/resizable/resizable";
```

These examples also use button, progress: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/progress.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Progress, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";
```

## ResizablePanelGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | ResizablePanels with a ResizableHandle between each pair (they may sit inside your own components). |
| orientation | "horizontal" \| "vertical" | "horizontal" | Direction the panels sit in: "horizontal" (side by side, default) or "vertical" (stacked). |
| layout | number[] | optional, no default | Panel sizes as percentages that add up to 100 (controlled). Pair with onLayoutChange. |
| defaultLayout | number[] | each panel's defaultSize | Starting sizes when uncontrolled: each panel's defaultSize, else an equal share of what is left. |
| onLayoutChange | ((layout: number[]) => void) | optional, no default | Called with the new sizes while a handle is dragged or moved with the keyboard. |
| keyboardStep | number | 5 | Percent a handle moves per arrow key (Shift moves five times as much). |
| disabled | boolean | false | Locks every handle so no panel can be resized. |
| labels | Partial<ResizableLabels> | defaultResizableLabels | Every other string, for translation: labels={{ resize: "…" }}; omitted keys keep the English of defaultResizableLabels. All 3 keys of ResizableLabels are listed in the key table under the props table. |

## ResizablePanel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| defaultSize | number | optional, no default | Starting size in percent. Panels without one share what is left equally. |
| minSize | number | 10 | Sets the smallest size in percent. |
| maxSize | number | 90 | Sets the largest size in percent. |

## ResizableHandle props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| withGrip | boolean | false | Draw a small grip in the middle of the line. |

## Example 1 of 2: Editor, preview and console

Drag a handle, or focus it and use the arrow keys. The middle pane holds a vertical group; every panel respects its minimum size.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Progress } from "@/components/sheenui/progress/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/sheenui/resizable/resizable";
// Package build (after the first npm release, or a packed tarball): import { Button, Progress, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";

export function Example() {
  return (
    <ResizablePanelGroup className="glass-1 h-[22rem] w-full rounded-sheen-xl text-xs">
      <ResizablePanel defaultSize={22} minSize={14}>
        <p className="p-3 font-semibold">Explorer</p>
        <ul className="m-0 list-none p-1.5">
          <li className="rounded-sheen-sm bg-sheen-hover px-2 py-1.5">App.tsx</li>
          <li className="px-2 py-1.5">Deploy.tsx</li>
          <li className="px-2 py-1.5">theme.css</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={62} minSize={25}>
            <pre className="m-0 p-3 leading-5">{"export function Deploy() {\n  return <Button>Deploy</Button>;\n}"}</pre>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={15}>
            <ul className="m-0 list-none p-3 leading-5">
              <li>✓ compiled in 142 ms</li>
              <li>ready on http://localhost:5173</li>
            </ul>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel minSize={18}>
        <div className="m-3 flex flex-col gap-4 rounded-sheen-lg bg-sheen-hover p-4">
          <Progress value={72} label="Build" />
          <Button variant="glass" size="sm" className="self-start">Deploy</Button>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

## Example 2 of 2: Controlled and remembered

Pass layout and onLayoutChange to own the sizes, for example to save them in localStorage and restore them on the next visit. The sizes are percentages that add up to 100.

```tsx
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/sheenui/resizable/resizable";
// Package build (after the first npm release, or a packed tarball): import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";

const KEY = "my-app:layout";

export function Example() {
  const [layout, setLayout] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? (JSON.parse(saved) as number[]) : [30, 70];
    } catch {
      return [30, 70];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(layout));
    } catch {
      /* private mode: the layout just resets next visit */
    }
  }, [layout]);

  return (
    <ResizablePanelGroup layout={layout} onLayoutChange={setLayout} className="h-48 rounded-sheen-lg border border-sheen-border">
      <ResizablePanel minSize={15} maxSize={60}>
        <p className="p-4 text-sm">Sidebar: {Math.round(layout[0] ?? 0)}%</p>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel>
        <p className="p-4 text-sm">Content: {Math.round(layout[1] ?? 0)}%</p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focuses a handle. |
| ← / → | Move the focused handle (↑ / ↓ in a vertical group) by keyboardStep percent. |
| Shift + arrow | Move it five times as far. |
| Home / End | Send the handle to the limit of its range. |
| Step buttons | Two buttons on the handle make the panel before it larger or smaller with a single press (the non-drag alternative); always visible on touch screens, shown on keyboard focus elsewhere. |
| Double click / double tap | Puts the divider back where it started. |

## Accessibility

- Each handle is a role="separator" (the ARIA window splitter pattern) with aria-orientation, aria-valuenow (percent of the panel before it), aria-valuemin, aria-valuemax and aria-controls, named by labels.resize.
- Every drag has a keyboard equivalent; the grab area is 44px on touch screens and works with mouse, touch and pen.
- Panels never shrink below minSize or grow past maxSize, so content is not lost. In right-to-left pages the arrow keys and the drag follow the reading direction.
- Resizing follows the pointer directly; there is no animation, so reduced motion changes nothing.

## All exports on this page

- ResizableHandle — The draggable divider between two panels of a ResizablePanelGroup.
- ResizablePanel — One panel of a ResizablePanelGroup.
- ResizablePanelGroup — Panels with draggable, keyboard-resizable handles between them: a file tree next to an editor, a list next to a detail pane, a console under a canvas.
- defaultResizableLabels — The English ResizableLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the resizable panels

- Use Resizable for an IDE-style workspace, an email client or a log viewer, where people drag a handle (or press the arrow keys) to choose how much room each area gets.
- Put ResizablePanel children in a ResizablePanelGroup with a ResizableHandle between each pair. Set minSize and maxSize so a panel never collapses past usefulness.
- Own the sizes with layout and onLayoutChange when you want to save them in localStorage or a user setting and restore them later.
- Skip it for a fixed two-column layout. CSS grid is lighter when nobody needs to resize.
- Pair it with ScrollArea inside each panel, with a vertical group nested in a horizontal one for editor layouts, and with Drawer for the phone version.


## Frequently asked questions

### How do I build a resizable split pane in React?

Render ResizablePanelGroup with a ResizableHandle between each pair of ResizablePanels. Panels register themselves, so they may sit inside your own components. Sizes are percentages that add up to 100; defaultLayout sets the start and onLayoutChange reports every move.

### Can the handles be moved with the keyboard or without dragging?

Yes. Each handle is a role=separator: focus it and use the arrow keys (Shift for bigger steps) and Home or End to jump to the limit of its range. Two step buttons on the handle make the panel before it larger or smaller with a single pointer press (the non-drag alternative), and a double click or double tap puts the divider back where it started.

### How do I save the layout?

Pass layout and onLayoutChange, store the array in localStorage in the handler, and read it back as the initial state. The page's second example shows it.

### Does it work in right-to-left pages?

Yes. The arrow keys and the drag follow the reading direction.


## Related pages

- [Scroll area](https://lokendra-builds.github.io/sheenui/layout/scroll-area)
- [Sidebar](https://lokendra-builds.github.io/sheenui/navigation/sidebar)
- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Separator](https://lokendra-builds.github.io/sheenui/layout/separator)
- [Stepper](https://lokendra-builds.github.io/sheenui/layout/stepper)
- [Timeline](https://lokendra-builds.github.io/sheenui/layout/timeline)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
