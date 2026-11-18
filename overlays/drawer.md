Canonical: https://lokendra-builds.github.io/sheenui/overlays/drawer

# React Drawer & Bottom Sheet with Swipe

URL: https://lokendra-builds.github.io/sheenui/overlays/drawer
Sidebar name: Drawer / Sheet

A glass React drawer and bottom sheet: drag handle, swipe to dismiss, snap points and safe-area insets, from any edge. Focus-trapped, Tailwind v4, MIT.

What it is: A glass React drawer that slides in from any edge, with bottom sheets you can drag, snap and swipe away. Use it as a bottom sheet for filters on a mobile product list, with snap points such as peek, half and full so people can glance at the filters or expand them to full height.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/drawer.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Drawer / Sheet

Files to copy from `theme/src/`:

- `components/drawer/drawer.tsx`
- `components/drawer/parts/{content.tsx, model.ts, parts.tsx}`
- `hooks/{use-direction.ts, use-latest.ts}`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: drawer. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerClose, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { type DrawerSnapPoint } from "@/components/sheenui/drawer/parts/model";
import { DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
import { Input } from "@/components/sheenui/input/input";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use button, input, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/input.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, type DrawerSnapPoint, DrawerTitle, DrawerTrigger, Input, Switch } from "@sheenui/theme";
```

## Drawer

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| modal | boolean \| "trap-focus" | true | Determines if the drawer enters a modal state when open. - true: user interaction is limited to just the drawer: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled. - false: user interaction with the rest of the document is allowed. - 'trap-focus': focus is trapped inside the drawer, but document page scroll is not locked and pointer interactions outside of it remain enabled. |
| side | DrawerSideProp | "bottom" | The edge the drawer slides in from. It is also the direction a swipe dismisses it. "left" and "right" are physical and never flip; "start" and "end" follow the text direction (<html dir> or Base UI's DirectionProvider): "start" is the left edge in ltr and the right edge in rtl. |
| snapPoints | readonly DrawerSnapPoint[] | optional, no default | Snap heights for a bottom sheet, smallest first. Ignored on other sides. |
| snapPoint | DrawerSnapPoint \| null | optional, no default | Controlled snap point (use with onSnapPointChange). |
| defaultSnapPoint | DrawerSnapPoint \| null | the first one | Snap point the sheet opens at. |
| onSnapPointChange | ((snapPoint: DrawerSnapPoint \| null, eventDetails?: BaseDrawer.Root.SnapPointChangeEventDetails) => void) | optional, no default | Called when the snap point changes: by a drag (with Base UI's event details), or by the handle button / keyboard / focus (no event details). |
| labels | DrawerLabelsInput | defaultDrawerLabels | Every other string, for translation: labels={{ close: "…" }}; omitted keys keep the English of defaultDrawerLabels. All 6 keys of DrawerLabelsInput are listed in the key table under the props table. |
| open / defaultOpen / onOpenChange | boolean / boolean / (open, details) => void | false | Controlled or uncontrolled open state (Base UI). |
| disablePointerDismissal | boolean | false | Keep it open on outside presses. |

## DrawerContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The sheet's content: usually DrawerHeader, DrawerBody and DrawerFooter. |
| showClose | boolean | true | Show the × button in the top corner. |
| handle | boolean | on for bottom and top sheets | Show the drag handle. |
| inset | boolean | false | Float the panel off the edges (rounded on every side) instead of attaching it to the edge. |
| keyboardAware | boolean | true | Keep focused fields above the on-screen keyboard (bottom sheets with forms). Uses Base UI's Drawer.VirtualKeyboardProvider. |
| container | HTMLElement \| ShadowRoot \| RefObject<HTMLElement \| ShadowRoot \| null> \| null | <body> | Where to portal the drawer (defaults to <body>). |
| viewportClassName | string | optional, no default | Adds extra classes to the full-screen positioning layer. |
| backdropClassName | string | optional, no default | Class for the dimmed scrim behind a modal drawer. |
| initialFocus / finalFocus | ref \| function \| boolean | panel / trigger | Where focus goes when it opens and closes (Base UI). |

## Parts

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| DrawerTrigger / DrawerClose | Base UI Trigger / Close | optional, no default | Use render={<Button />} to style them as buttons. |
| DrawerHeader | div | optional, no default | Title and description; stays put while the body scrolls. |
| DrawerBody | Base UI Drawer.Content | optional, no default | The scrolling part. A tab stop only while it overflows; mouse text selection never drags the sheet. |
| DrawerFooter | div | optional, no default | Actions: stacked on phones, a right-aligned row from sm. |
| DrawerSwipeArea | Base UI SwipeArea | optional, no default | Invisible edge strip that opens the drawer with a swipe (touch screens). |
| createDrawerHandle() | () => Handle | optional, no default | Open a drawer from triggers elsewhere: <Drawer handle={h}> + <DrawerTrigger handle={h}>. |

## Example 1 of 4: Bottom sheet

Swipe the sheet down (or press Escape, or tap outside) to dismiss it. Releasing a quick flick keeps its momentum; a button close is shorter and never overshoots.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerClose, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, Input } from "@sheenui/theme";

const targets = [{ label: "Copy link" }, { label: "Email" }, { label: "Chat app" }];
const share = (target: { label: string }) => console.log("share via", target.label);

export function Example() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Share</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share “Q3 roadmap”</DrawerTitle>
          <DrawerDescription>Anyone in Acme with the link can view and comment.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {targets.map((t) => (
            <DrawerClose key={t.label} onClick={() => share(t)}>{t.label}</DrawerClose>
          ))}
          <Input label="Link" readOnly defaultValue="https://example.com/d/q3-roadmap" />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="glass" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

## Example 2 of 4: Snap points

Peek, half and full heights. Peek is measured from the content (handle, header and the first row) and half always shows more than peek, even on a landscape phone. Drag between them, flick to skip one, or use the handle: it is a button that reads out the current height (Enter cycles, arrow keys step). Keyboard focus is never hidden: rows scroll into view inside the sheet, and a control that can't (below the screen edge) opens it fully. A click or tap never changes the height.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { type DrawerSnapPoint } from "@/components/sheenui/drawer/parts/model";
import { DrawerBody, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
// Package build (after the first npm release, or a packed tarball): import { Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, type DrawerSnapPoint, DrawerTitle, DrawerTrigger } from "@sheenui/theme";

const places = [{ name: "Café Aurora" }, { name: "Riverside Park" }, { name: "Night Market" }];

export function Example() {
  // "peek" = handle + header + first row (measured); "half" = 50% of the screen, at least a row above peek.
  // Your own heights work too: snapPoints={["148px", 0.6, 1]}
  // Translate the handle: labels={{ snapPoints: { half: "Halbe Höhe" } }}
  const [snap, setSnap] = useState<DrawerSnapPoint | null>("half");

  return (
    <Drawer snapPoints={["peek", "half", "full"]} snapPoint={snap} onSnapPointChange={setSnap}>
        <DrawerTrigger render={<Button variant="glass" />}>Nearby places</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nearby</DrawerTitle>
            <DrawerDescription>12 places within 2 km.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>{places.map((p) => (
                <p key={p.name}>{p.name}</p>
              ))}</DrawerBody>
        </DrawerContent>
      </Drawer>
  );
}
```

## Example 3 of 4: Side and top sheets

side picks the edge (and the swipe direction that closes it). inset floats the panel off the edges with rounded corners.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerClose, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { DrawerBody, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
import { Input } from "@/components/sheenui/input/input";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, Input, Switch } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Drawer side="left">
        <DrawerTrigger render={<Button variant="glass" />}>Menu</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <DrawerClose render={<Button variant="ghost" fullWidth />}>Home</DrawerClose>
            <DrawerClose render={<Button variant="ghost" fullWidth />}>Projects</DrawerClose>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer side="right">
        <DrawerTrigger render={<Button variant="glass" />}>Settings</DrawerTrigger>
        <DrawerContent inset>
          <DrawerHeader>
            <DrawerTitle>Notification settings</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Input label="Email" type="email" defaultValue="ada@example.com" />
            <Switch label="Mentions" defaultChecked />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
            <DrawerClose render={<Button />}>Save</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer side="top">
        <DrawerTrigger render={<Button variant="glass" />}>Announcement</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>What's new</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Got it</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
```

## Example 4 of 4: Nested sheets

A drawer opened from inside another one stacks on top; the one behind steps back and dims. Swipe or Escape closes only the front one.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerClose, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { DrawerBody, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
// Package build (after the first npm release, or a packed tarball): import { Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@sheenui/theme";

const standard = { id: "standard", label: "Standard · free" };
const options = [standard, { id: "express", label: "Express · $5" }];

export function Example() {
  const [delivery, setDelivery] = useState("standard");
  const chosen = options.find((o) => o.id === delivery) ?? standard;

  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Cart (3)</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Your cart</DrawerTitle></DrawerHeader>
        <DrawerBody>
          <p>3 items · $126.00</p>
          <Drawer>
            <DrawerTrigger>Delivery: {chosen.label}</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Delivery</DrawerTitle></DrawerHeader>
              <DrawerBody>{options.map((o) => <DrawerClose key={o.id} onClick={() => setDelivery(o.id)}>{o.label}</DrawerClose>)}</DrawerBody>
            </DrawerContent>
          </Drawer>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button fullWidth />}>Pay $131</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space | Open it from the trigger. |
| Tab / Shift + Tab | Cycle inside; focus is trapped while it is modal. |
| Escape | Close it and return focus to the trigger. |
| Enter / Arrow Up / Arrow Down | On the handle, with snap points: cycle or step through the heights. |

## Accessibility

- A modal dialog (Base UI): named by DrawerTitle, described by DrawerDescription; the page behind is inert.
- The handle is a real button with snap points and tells screen readers the current height. A swipe is a shortcut: a button always closes it.
- Under reduced motion the sheet fades instead of sliding.

## All exports on this page

- Drawer — Drawer / sheet: a strong-glass panel that slides in from an edge of the screen.
- DrawerBody — The scrolling part of the sheet.
- DrawerClose — A button inside the drawer that closes it (a "Done" or "Cancel" action in DrawerFooter).
- DrawerContent — The glass panel of a Drawer, portalled to the end of the body with a dimmed scrim (for a modal drawer).
- DrawerDescription — Muted helper text under the title.
- DrawerFooter — Bottom row of actions, separated by a hairline: a column on phones (primary action first on screen) and a right-aligned row from sm up.
- DrawerHandle — The grab bar.
- DrawerHeader — Top section of the sheet: stacks the title and description, with room on the right for the × button.
- DrawerSwipeArea — An invisible strip along a screen edge that opens the drawer with a swipe (touch screens).
- DrawerTitle — The drawer's heading.
- DrawerTrigger — The element that opens a Drawer (a <button> by default; use render={<Button />} for a SheenUI button).
- createDrawerHandle — Connects a Drawer to triggers rendered elsewhere: <Drawer handle={h}> + <DrawerTrigger handle={h}>.
- createSideDrawerHandle — Connects a SideDrawer to triggers rendered elsewhere: <SideDrawer handle={h}> + <SideDrawerTrigger handle={h}>.
- defaultDrawerLabels — Default English strings of DrawerLabels; spread it and override single keys to reword.
- drawerSnapPresets — Starting values of the presets.


## When to use the Drawer / Sheet

- Use it for a mobile bottom sheet that people drag between a peek, half and full height, such as filters on a product list or a place card on a map, or as a side panel on desktop.
- Use it for a navigation menu or cart panel sliding in from the left or right with side="left" or "right", or floating off the edge with the inset prop on DrawerContent.
- Use it for a quick form on a phone, where keyboardAware (on by default) keeps focused fields above the on-screen keyboard while the sheet remains swipeable.
- Skip it when you need a centered modal, which Dialog handles, or a record detail and edit panel with close guards and resizing, where SideDrawer is built for that.
- Pair it with Button through the render prop on DrawerTrigger, Tabs or RadioGroup inside DrawerBody for filter controls, and Toast to report that the applied choices were saved.


## Frequently asked questions

### How do I build a bottom sheet in React with snap points?

Pass snapPoints such as ["peek", "half", "full"] to Drawer, or your own heights as fractions of the viewport, pixel numbers or strings like 18rem. Control it with snapPoint and onSnapPointChange. The peek height is measured from the handle, header and first body row.

### How do I use the drag handle with a keyboard?

With snap points, the handle is a real button: click or Enter cycles them, ArrowUp and ArrowDown step through them, and it tells screen readers the current height. Escape closes the drawer. The popup is role="dialog" named by DrawerTitle, and the page behind is inert.

### Which sides and modes does Drawer support?

side can be bottom (the default), top, left or right, plus start and end, which follow the text direction. Snap points apply to bottom sheets only. modal defaults to true, which traps focus and locks scroll. Safe-area insets are padded wherever the panel touches a screen edge, so notches and home indicators do not cover content. It is built on Base UI Drawer.

### What does reduced motion change?

With reduced motion, from the OS or the data-motion reduced attribute, the panel fades in place instead of sliding. Dragging still follows the finger, because that is direct manipulation. Reduced transparency and forced colors give the glass-3 panel a solid surface.


## Related pages

- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)
- [Hover card](https://lokendra-builds.github.io/sheenui/overlays/hover-card)
- [Kbd](https://lokendra-builds.github.io/sheenui/overlays/kbd)
- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)
- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
