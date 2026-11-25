Canonical: https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix

# Base UI vs Radix UI for React in 2026

URL: https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix
Sidebar name: Base UI vs Radix

Base UI vs Radix UI for React compared on checked data: component coverage, render prop vs asChild, release dates, shadcn support and migration notes.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 12, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Guides](https://lokendra-builds.github.io/sheenui/guides/) > Base UI vs Radix UI for React in 2026

The Base UI vs Radix question used to be easy: Radix was stable and Base UI was alpha. As of 8 Nov 2026 both are stable, both are MIT, both are used by shadcn/ui, and shadcn/ui now defaults to Base UI. Short answer: for a new project use Base UI, the library shadcn/ui now defaults to; stay on Radix if you already ship it, since both are stable, both are MIT and migrating is a mechanical `asChild`-to-`render` change. This guide compares them on facts we checked today (npm, GitHub, their docs, and ui.shadcn.com), shows the one API difference that matters (`render` vs `asChild`) with compiling examples, and gives concrete migration notes. SheenUI, our glass component library, is built on Base UI (see the [Base UI docs page](https://lokendra-builds.github.io/sheenui/docs/base-ui), the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) and the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)); we explain why in its own section, and also when staying on Radix is the right call.

Basis: npm, GitHub, the two projects' own docs and ui.shadcn.com, quoted with the date each fact was gathered (most are dated 8 Nov 2026 in the text), plus the fact that SheenUI is built on Base UI. First published 8 Nov 2026, last revised 12 Nov 2026; each figure keeps the date given next to it, and stars, versions and push dates can have changed since.

## What both are

Radix Primitives is an unstyled, accessible React component library. The repository description says it is "Maintained by @workos" ([radix-ui/primitives](https://github.com/radix-ui/primitives), 19,479 stars, last push 14 Oct 2026). On npm, `@radix-ui/react-dialog` 1.0.0 was published on 20 Jul 2022; the current version is 1.3.1 (12 Oct 2026). The umbrella `radix-ui` package is at 1.8.1 (12 Oct 2026) and is the install the docs now recommend, with per-primitive `@radix-ui/react-*` packages as the alternative. Peer dependency range: React 16.8 through 19.

Base UI is also unstyled and accessible, developed in the [mui/base-ui](https://github.com/mui/base-ui) repository (11,324 stars, last push 7 Nov 2026). Its about page says it comes from "the creators of Radix, Material UI, and Floating UI" and lists a seven-person team. Version 1.0.0 shipped on 11 Dec 2025 (the releases page marks it "Stable"); the current version is 1.9.0 (9 Oct 2026). The package is `@base-ui/react`, a single tree-shakable package. The older name `@base-ui-components/react` stopped at `1.0.0-rc.0`; if you see it in a tutorial, it is the pre-1.0 package. Peer dependency range: React 17 through 19.

## Component coverage table

Lists taken on 8 Nov 2026 from the Base UI docs navigation (37 components) and from the `@radix-ui/react-*` dependencies of `radix-ui@1.8.1` (30 component packages, excluding internal utilities such as `popper`, `presence` and `slot`).

| Area | Base UI 1.9.0 | Radix 1.8.1 |
|---|---|---|
| Overlays | Alert Dialog, Dialog, Drawer, Popover, Preview Card, Tooltip, Toast | Alert Dialog, Dialog, Popover, Hover Card, Tooltip, Toast |
| Menus | Menu, Context Menu, Menubar, Navigation Menu | Dropdown Menu, Context Menu, Menubar, Navigation Menu |
| Selection | Select, Combobox, Autocomplete, Radio Group, Checkbox, Checkbox Group, Switch, Toggle, Toggle Group | Select, Radio Group, Checkbox, Switch, Toggle, Toggle Group |
| Forms | Field, Fieldset, Form, Input, Number Field, OTP Field, Slider | Form, Label, One-Time Password Field, Password Toggle Field, Slider |
| Layout and disclosure | Accordion, Collapsible, Tabs, Scroll Area, Separator, Toolbar | Accordion, Collapsible, Tabs, Scroll Area, Separator, Toolbar, Aspect Ratio |
| Display | Avatar, Button, Meter, Progress | Avatar, Progress |

Only in Base UI: Autocomplete, Button, Checkbox Group, Combobox, Drawer, Field, Fieldset, Input, Meter, Number Field. Only in Radix: Aspect Ratio, Label, Password Toggle Field (Base UI covers labels through `Field.Label`). Everything else exists on both sides, sometimes under a different name (Preview Card is Radix's Hover Card; Menu is Radix's Dropdown Menu).

## API differences: `render` vs `asChild`

Both libraries let you replace the element a part renders. Radix uses the `asChild` boolean and clones the single child; Base UI uses a `render` prop that takes an element or a function. In both cases your component must spread the received props onto its DOM node and forward the ref.

The Base UI example compiles against `@base-ui/react` 1.9.0 and React 19 (where `ref` is a normal prop):

```tsx
import type { ComponentProps } from "react";
import { Dialog } from "@base-ui/react/dialog";

// Base UI passes props and ref through `render`; the element only has to spread them.
function GlassButton(props: ComponentProps<"button">) {
  return <button className="glass-button" {...props} />;
}

export function BaseUiExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<GlassButton />}>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="scrim" />
        <Dialog.Popup className="glass-dialog">
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Changes are saved when you press Save.</Dialog.Description>
          <Dialog.Close render={<GlassButton />}>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

The Radix version, verified separately with `radix-ui@1.8.1`, React 19 and `tsc`:

```tsx external
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Dialog } from "radix-ui";

// asChild only works when the child spreads its props and forwards its ref.
const GlassButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>(
  function GlassButton(props, ref) {
    return <button ref={ref} className="glass-button" {...props} />;
  },
);

export function RadixExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <GlassButton>Open</GlassButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="scrim" />
        <Dialog.Content className="glass-dialog">
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Changes are saved when you press Save.</Dialog.Description>
          <Dialog.Close asChild>
            <GlassButton>Close</GlassButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Two further Base UI features have no Radix equivalent. `render` also accepts a function `(props, state) => element`, so you can read state (the docs show `state.checked` on `Switch.Thumb`) and decide what to render. And `className` and `style` accept functions of the same state, for example `className={(state) => (state.checked ? "checked" : "unchecked")}` ([Base UI styling handbook](https://base-ui.com/react/handbook/styling)). Radix exposes state through data attributes only.

## Accessibility and maintenance

Both libraries implement the WAI-ARIA patterns (roles, keyboard navigation, focus management) and both document per-component keyboard behavior; we found no data that ranks one above the other, so we make no claim there.

Maintenance, from the dates above: Radix shipped `radix-ui` 1.8.1 and `@radix-ui/react-dialog` 1.3.1 on 12 Oct 2026 and last pushed on 14 Oct 2026, so it is actively released. Base UI shipped 1.9.0 on 9 Oct 2026 and last pushed on 7 Nov 2026; it has gone from 1.0.0 to 1.9.0 in eleven months. Radix went from `radix-ui` 1.3.1 (18 Apr 2025) to 1.8.1 (12 Oct 2026). Neither repository is archived. Read this as "both maintained, Base UI adding components faster", nothing more.

## shadcn support for both

Checked on [ui.shadcn.com](https://ui.shadcn.com/docs/cli) on 8 Nov 2026:

- The July 2026 changelog entry "Base UI as the Default" says: "New projects now use Base UI by default. Radix is still fully supported." It cites Base UI being at 1.6.0 with 6M+ weekly downloads at the time and that "Projects created on shadcn/create now pick Base UI over Radix 2 to 1".
- Existing projects: "You do not need to migrate." Every update and new component ships for both libraries unless a component exists only in Base UI.
- The CLI's `init` has a `-b, --base <base>` option with choices `base`, `radix` and `aria`; to keep Radix in scripts run `pnpm dlx shadcn init -b radix`.
- Component pages carry three variants, "Base UI", "React Aria" and "Radix UI". The October 2026 entry notes new components (Trace, Code Block) "are available for Base UI, React Aria and Radix across all eight styles".
- The CLI also has a `migrate radix` command that moves a project from individual `@radix-ui/react-*` packages to the single `radix-ui` package. We found nothing in the CLI docs about converting a project from Radix to Base UI.

## Why SheenUI chose Base UI

SheenUI (ours) depends on `@base-ui/react` 1.9.0, and the reasons are visible in `theme/src/components`:

- The `render` prop is how every trigger takes a glass button: `DialogTrigger` and `DialogClose` are re-exports of `BaseDialog.Trigger` and `BaseDialog.Close`, and the docs show `<DialogTrigger render={<Button>Edit profile</Button>} />`. See the [Dialog page](https://lokendra-builds.github.io/sheenui/components/dialog) and the [Button page](https://lokendra-builds.github.io/sheenui/components/button).
- Dialog, Tabs, Field and Menu parts map directly onto Base UI parts. `dialog.tsx` wraps `BaseDialog.Popup`, `Title` and `Description`; `tabs.tsx` wraps `BaseTabs.Root`, `List`, `Tab`, `Indicator` and `Panel`; `@base-ui/react/field` is used by the input, textarea, number field and radio group; `@base-ui/react/menu` by the menu, menubar, breadcrumb and data table.
- The Tabs indicator uses Base UI's CSS variables. `TabsList` renders `BaseTabs.Indicator` with `h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left)`, so the sliding glass pill is pure CSS with no JavaScript animation. Base UI documents `--active-tab-top`, `--active-tab-right`, `--active-tab-bottom`, `--active-tab-left`, `--active-tab-width` and `--active-tab-height` on `Tabs.Indicator` ([Base UI Tabs](https://base-ui.com/react/components/tabs)). Radix Tabs has no indicator part. See the [Tabs page](https://lokendra-builds.github.io/sheenui/components/tabs).
- Dialog animations are CSS keyed on `data-starting-style` and `data-ending-style`, which Base UI sets on the popup itself. Animating the glass popup directly (never a wrapper) is what keeps the blur from flickering.

## Migration notes

Concrete differences, each checked against the two docs sites on 8 Nov 2026.

Package imports:

- `import { Dialog } from "radix-ui"` (or `"@radix-ui/react-dialog"`) becomes `import { Dialog } from "@base-ui/react/dialog"`. Each Base UI component has its own subpath.

Composition:

- `<Dialog.Trigger asChild><MyButton /></Dialog.Trigger>` becomes `<Dialog.Trigger render={<MyButton />}>label</Dialog.Trigger>`. Children move onto the trigger. With React 19 the custom component no longer needs `forwardRef`, but it still has to spread props.

Part names (Dialog):

- Radix `Overlay`, `Content` become Base UI `Backdrop`, `Popup`. Base UI adds an optional `Viewport` ("a positioning container for the dialog popup that can be made scrollable"). `Root`, `Trigger`, `Portal`, `Title`, `Description`, `Close` keep their names.

Part names (Tabs):

- Radix `Trigger`, `Content` become `Tab`, `Panel`; Base UI adds `Indicator`.

Data attributes:

- Radix Dialog Content: `data-state="open" | "closed"`. Base UI Popup: `data-open`, `data-closed`, plus `data-starting-style` and `data-ending-style` for enter and exit animations, and `data-nested`, `data-nested-dialog-open`.
- Radix Tabs Trigger: `data-state="active" | "inactive"`. Base UI Tab: `data-active` (present when active). Both use `data-disabled` and `data-orientation`.
- Tailwind selectors change accordingly: `data-[state=open]:` becomes `data-open:`, `data-[state=active]:` becomes `data-active:`.

Renamed components:

- Hover Card becomes Preview Card; Dropdown Menu becomes Menu; One-Time Password Field becomes OTP Field; Label becomes `Field.Label` inside `Field.Root`.

Animations:

- Radix exit animations key on `data-state="closed"`. Base UI sets `data-starting-style` while the popup animates in and `data-ending-style` while it animates out, so enter and exit transitions are plain CSS on the popup element.

## When not to switch: staying on Radix

- You have no complaint. shadcn/ui says "If your app works, keep shipping", and Radix shipped releases in October 2026.
- You need React 16.8 or 17 support: Radix supports 16.8 and up; Base UI starts at 17.
- You use Aspect Ratio or Password Toggle Field, which Base UI does not ship.
- Your team's Tailwind and tests are full of `data-[state=...]` selectors and you have no budget for the rename; the attribute changes above touch every styled part.
- A third-party library you depend on already pins Radix (for example a glass theme; see our [library comparison](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries)). Mixing both primitives in one app works but doubles bundle weight for overlapping components.

## Frequently asked questions

### Is Base UI a Radix UI alternative or a replacement?

An alternative with overlapping authors. The Base UI about page says it comes from "the creators of Radix, Material UI, and Floating UI". Radix is still maintained (releases on 12 Oct 2026) and still a shadcn/ui option.

### Base UI or Radix UI for a new shadcn/ui project?

shadcn/ui picks Base UI by default since July 2026 and reports a 2 to 1 preference among `shadcn/create` users. Choose Radix explicitly with `-b radix` if you need React 16.8 or 17 or a Radix-only primitive.

### How hard is it to migrate Radix to Base UI?

Mechanical but wide: change imports, swap `asChild` for `render`, rename Overlay to Backdrop and Content to Popup, and rewrite `data-[state=...]` selectors to `data-open` and `data-active`. Do it one component at a time; both libraries can coexist during the move.

### Does Base UI need its own styling system?

No. Both ship unstyled. SheenUI styles Base UI with Tailwind CSS v4 utilities and the data attributes above; see the [foundations page](https://lokendra-builds.github.io/sheenui/foundations).

---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
