Canonical: https://lokendra-builds.github.io/sheenui/docs/base-ui

# Base UI Components Styled with Glass & Motion

URL: https://lokendra-builds.github.io/sheenui/docs/base-ui
Sidebar name: Built on Base UI

SheenUI styles Base UI's accessible headless components with glass and Motion: Tailwind CSS v4 styling, keyboard and ARIA from Base UI. MIT.

By Lokendra Singh Rathore. Published November 11, 2026, updated November 26, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Built on Base UI

SheenUI styles Base UI's accessible headless components with glass and Motion, so keyboard, focus and ARIA behavior comes from Base UI.

## What Base UI does for SheenUI

Base UI is a set of unstyled, accessible React primitives. SheenUI wraps them: the primitive supplies the behavior (state, focus management, keyboard handling and ARIA), and SheenUI supplies the glass surface, the Tailwind CSS v4 classes and the Motion animation. That split is why a styled Base UI component here keeps its accessibility when you change how it looks.

The theme imports primitives for dialogs and alert dialogs, drawers, popovers, tooltips, preview cards, menus, context menus, menubars, navigation menus, tabs, accordions, collapsibles, selects, comboboxes, autocompletes, checkboxes, radio groups, switches, toggles, sliders, number fields, one-time-code fields, fields and fieldsets, progress and meter, scroll areas, toasts, toolbars and avatars. Each docs page names the primitive it is built on in its source link.


## Styled Base UI components with Tailwind CSS v4

Base UI exposes state as data attributes (open, checked, disabled, active) and CSS variables (the sliding tab indicator reads its size and position from variables). SheenUI styles those hooks with Tailwind variants, so there is no runtime styling library and no theme provider beyond the optional motion provider. See the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) for how the tokens reach the classes.

Animation is layered on top: a dialog springs in with Motion while Base UI owns the focus trap, and under reduced motion the spring becomes a short fade. The [glass modal dialog](https://lokendra-builds.github.io/sheenui/components/dialog) and [animated tabs](https://lokendra-builds.github.io/sheenui/components/tabs) show both layers.


## Which primitive sits under which component

Eight of the wrappers, with the Base UI module each one imports and the behavior that stays the primitive’s. SheenUI adds the glass classes, the Motion animation and flat part names on top.

SheenUI components, the Base UI primitive each wraps, and what stays Base UI’s

| SheenUI component | Base UI primitive | Stays Base UI’s |
| --- | --- | --- |
| Dialog | @base-ui/react/dialog | focus trap, Escape, scroll lock, focus return |
| Menu | @base-ui/react/menu | arrow keys, typeahead, submenu handling |
| Popover | @base-ui/react/popover | positioning, outside-click dismissal, focus handling |
| Tooltip | @base-ui/react/tooltip | open delays, hover and focus triggers |
| Select | @base-ui/react/select | listbox semantics, typeahead, form value |
| Tabs | @base-ui/react/tabs | arrow-key movement, tab and panel ARIA |
| Checkbox | @base-ui/react/checkbox | checked and indeterminate state, form input |
| Switch | @base-ui/react/switch | checked state, form input |

## The render prop instead of asChild

Where Radix uses asChild, Base UI uses a render prop that takes an element or a function. It is how a button becomes a router link without losing its styles. Read [Base UI vs Radix](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix) for a checked comparison of coverage and migration, and [shadcn alternatives](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives) for how this fits the copy-paste approach, or [shadcn glassmorphism](https://lokendra-builds.github.io/sheenui/guides/shadcn-glassmorphism) to add glass to a shadcn/ui project.


## What a wrapper looks like

A SheenUI component is a thin layer over one primitive. It forwards props and the render prop to the primitive, adds the glass classes and the Motion animation, and exports the parts as flat names (Dialog, DialogTrigger, DialogContent, DialogTitle) where Base UI nests them (Dialog.Root, Dialog.Trigger, Dialog.Popup). The state of the primitive stays the source of truth: controlled and uncontrolled use follow Base UI’s value, defaultValue and onValueChange (open, defaultOpen and onOpenChange for overlays).

That is also the limit. Where Base UI has no primitive (the charts, the chat blocks, the data table on TanStack Table), SheenUI writes the behavior itself, and its tests run an axe check on every component.


## Imports and bundle size

The theme imports every primitive from its own subpath, such as @base-ui/react/dialog or @base-ui/react/menu, and never from the package root. A bundler therefore pulls in only the primitives behind the components you use: a project that copies the Button and the Dialog does not ship the Menu or the Combobox. The declared range is @base-ui/react ^1.9.0, as a peer dependency of the theme.


## Base UI utilities beyond the primitives

Some components have no primitive and still accept the render prop: Button, Breadcrumb, Sidebar, AspectRatio, BlurIn and LiquidGlass build it with Base UI’s useRender hook, so render={<a href="/pricing" />} works on all of them the same way it works on a dialog trigger. Field merges its own props with the control’s through mergeProps, and Tabs sets Base UI’s DirectionProvider, which is how right-to-left layouts reach the arrow-key order. The theme reads the text direction through Base UI’s useDirection as well, so a dir set on the page or on an ancestor is followed.


## Restyling a wrapper without losing its behavior

className goes on the outer element of a component and is merged with the glass classes, so yours wins. Inner parts take their own partClassName prop (triggerClassName on the Select button, for example), and every string the component shows or announces lives in a labels prop. None of this touches the primitive, so keyboard handling, focus return and ARIA keep working after a restyle.


## What you install

The shadcn CLI and the packed package add @base-ui/react as a peer dependency, next to motion, clsx and tailwind-merge. See the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) for the commands.


## Frequently asked questions

### Do I have to install Base UI myself?

The shadcn CLI and the packed package both add @base-ui/react for you. If you copy files by hand, run pnpm add @base-ui/react next to motion, clsx and tailwind-merge, because it is a peer dependency and the components import its primitives directly.

### Can I use Radix components next to SheenUI?

Yes, nothing is shared at runtime. Base UI and Radix are separate packages with separate state, so mixing them only costs bundle size; avoid nesting one library's overlay inside the other's focus trap.

### Where does the focus and keyboard behavior come from?

From Base UI. SheenUI adds the glass styling, the Motion animation and the Tailwind classes, but arrow-key movement, typeahead, focus return and Escape handling are the primitive's, which is why they stay correct when you restyle.

### Which Base UI version does SheenUI need?

@base-ui/react 1.9 or newer within version 1 (^1.9.0). It is a peer dependency, so your app owns the version, and the theme imports each primitive from a subpath like @base-ui/react/dialog so unused ones stay out of the bundle.

### How do I replace the element a component renders?

Use the render prop, Base UI's equivalent of Radix asChild. SheenUI's Button accepts render={<a href="..." />} to become a link, and the hero buttons on this site do exactly that.


## Related pages

- [Base UI vs Radix](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix)
- [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog)
- [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs)
- [Right-to-left and localisation](https://lokendra-builds.github.io/sheenui/docs/rtl)
- [Performance](https://lokendra-builds.github.io/sheenui/docs/performance)
- [About SheenUI](https://lokendra-builds.github.io/sheenui/about)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
