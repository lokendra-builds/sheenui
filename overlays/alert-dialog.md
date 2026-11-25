Canonical: https://lokendra-builds.github.io/sheenui/overlays/alert-dialog

# React Alert Dialog for Confirmations

URL: https://lokendra-builds.github.io/sheenui/overlays/alert-dialog
Sidebar name: Alert dialog

A glass React alert dialog for actions that matter: it focuses the safe choice, shows a spinner while it runs and keeps errors visible. Base UI.

What it is: A glass React alert dialog that asks before destructive actions, focuses the safe choice first and stays open with the error if the action fails.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/alert-dialog.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Alert dialog

Files to copy from `theme/src/`:

- `components/alert-dialog/`
- `components/button/`
- `components/input/`
- `components/spinner/`
- `hooks/{use-controllable.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, modal-tab-trap.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: alert-dialog. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ConfirmDialog, useConfirm } from "@/components/sheenui/alert-dialog/alert-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/sheenui/alert-dialog/parts/icons-content";
import { Button } from "@/components/sheenui/button/button";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Button, ConfirmDialog, useConfirm, useToast } from "@sheenui/theme";
```

## ConfirmDialog

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| trigger | ReactElement<unknown, string \| JSXElementConstructor<any>> | optional, no default | Element that opens the dialog, e.g. <Button variant="danger">Delete</Button>. Omit it to control the dialog with open. |
| open | boolean | optional, no default | Controlled open state. Pair it with onOpenChange. |
| defaultOpen | boolean | false | Initial open state when uncontrolled. |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called with the next open state when the dialog opens or is dismissed. |
| onOpenChangeComplete | ((open: boolean) => void) | optional, no default | Called after the close animation has finished. |
| tone | AlertDialogTone | "danger" | Colours the icon and the action button, and decides what is focused first. |
| icon | ReactNode | optional, no default | Replace the tone icon, or pass null to hide it. |
| title | ReactNode | required | The question, e.g. "Delete 3 files?". It names the dialog for screen readers. |
| description | ReactNode | optional, no default | Supporting text: what happens and whether it can be undone. |
| children | ReactNode | optional, no default | Extra content between the text and the buttons (a list of what will be affected, …). |
| confirmLabel | ReactNode | optional, no default | Shorthand for labels.confirm. |
| cancelLabel | ReactNode | optional, no default | Shorthand for labels.cancel. |
| onConfirm | (() => unknown) | optional, no default | Runs when the action is pressed. Return a promise to show a loading state: the dialog stays open (and can't be dismissed) until it settles, closes on success, and shows the error on failure. |
| onCancel | (() => void) | optional, no default | Called when the dialog is dismissed without confirming (Cancel, Escape). |
| confirmationText | string | optional, no default | Require typing this text (e.g. a project name) before the action is enabled. |
| errorMessage | ((error: unknown) => ReactNode) | optional, no default | Turn a thrown error into the message shown in the dialog. |
| labels | Partial<ConfirmDialogLabels> | defaultConfirmDialogLabels | Every other string, for translation: labels={{ confirm: "…" }}; omitted keys keep the English of defaultConfirmDialogLabels. All 5 keys of ConfirmDialogLabels are listed in the key table under the props table. |
| initialFocus | boolean \| RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| HTMLElement \| null \| void) | Cancel (danger, warning), the action (info) | Element focused when it opens: Cancel for danger / warning, the action for info, and the field with confirmationText. |
| finalFocus | boolean \| RefObject<HTMLElement \| null> \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) | the trigger (or the element focused before it opened) | Where focus goes when it closes. |
| className | string | optional, no default | Adds extra classes to the dialog panel. |

## Parts and hook

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| AlertDialog | Base UI AlertDialog.Root | optional, no default | open / defaultOpen / onOpenChange, handle for detached triggers. |
| AlertDialogHeader | div | optional, no default | Icon + title + description: centered on phones, icon on the left from sm. |
| useConfirm() | [confirm(options) => Promise<boolean>, dialog] | optional, no default | Render dialog once; await confirm() anywhere. Options are ConfirmDialog props (finalFocus / initialFocus included). |
| createAlertDialogHandle() | () => Handle | optional, no default | One dialog for many triggers (e.g. every table row). |

## AlertDialogAction props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| size | "sm" \| "md" \| "lg" \| "icon" | "md" | Height and padding, the same scale as every form field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), or "icon" for a square as tall as "md". |
| nativeButton | boolean | true; false when render is a non-button element | Whether the rendered element is a native <button>. Defaults to true, or to false when render is something else (e.g. a link): then type/disabled are not added and the disabled state is announced with aria-disabled instead. |
| trailing | ReactNode | optional, no default | Renders an icon after the children. |
| loading | boolean | false | Shows a spinner, ignores clicks and sets aria-busy. Focus stays on the button. |
| leading | ReactNode | optional, no default | Renders an icon before the children. |
| fullWidth | boolean | false | Stretch to the full width of the container. |
| stateLight | boolean | false | Lights the button by state: loading glows in the accent colour (data-state="working"), and a data-state of "success", "warning" or "error" flashes its own glow once (an aura, a light pool and a lit edge, drawn on the button's own layer). The state is never conveyed by light alone: keep the label or icon that says it. Off with reduced transparency and forced colours; instant with reduced motion. |
| closeOnClick | boolean | true | Close the dialog when pressed. Turn off to run async work first (and set loading). |
| variant | "link" \| "danger" \| "primary" \| "glass" \| "outline" \| "ghost" | "danger" for the danger tone, otherwise "primary" | Visual style. By default it follows the dialog's tone: a danger button for the danger tone, a primary one for every other tone. |

## AlertDialogCancel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "link" \| "danger" \| "primary" \| "glass" \| "outline" \| "ghost" | "glass" | Look: "primary" (accent fill), "glass" (frosted), "outline" (edge only), "ghost" (text only), "link" (inline link look) or "danger" (destructive). |
| size | "sm" \| "md" \| "lg" \| "icon" | "md" | Height and padding, the same scale as every form field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), or "icon" for a square as tall as "md". |
| loading | boolean | false | Shows a spinner, ignores clicks and sets aria-busy. Focus stays on the button. |
| leading | ReactNode | optional, no default | Renders an icon before the children. |
| trailing | ReactNode | optional, no default | Renders an icon after the children. |
| fullWidth | boolean | false | Stretch to the full width of the container. |
| stateLight | boolean | false | Lights the button by state: loading glows in the accent colour (data-state="working"), and a data-state of "success", "warning" or "error" flashes its own glow once (an aura, a light pool and a lit edge, drawn on the button's own layer). The state is never conveyed by light alone: keep the label or icon that says it. Off with reduced transparency and forced colours; instant with reduced motion. |
| nativeButton | boolean | true; false when render is a non-button element | Whether the rendered element is a native <button>. Defaults to true, or to false when render is something else (e.g. a link): then type/disabled are not added and the disabled state is announced with aria-disabled instead. |

## AlertDialogContent props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | Holds the dialog body: usually AlertDialogHeader and AlertDialogFooter. |
| tone | AlertDialogTone | "danger" | Colours the icon and the default action button. |
| icon | ReactNode | the built-in icon for the tone | Replace the tone icon, or pass null to hide it. |
| container | HTMLElement \| ShadowRoot \| RefObject<HTMLElement \| ShadowRoot \| null> \| null | document.body | Sets where the dialog is portalled. |
| backdropClassName | string | optional, no default | Sets the class of the dimmed scrim. |

## AlertDialogIcon props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tone | AlertDialogTone | the surrounding dialog's tone | Which tone's shape and color to draw; defaults to the surrounding dialog's tone. |

## Example 1 of 4: Destructive confirmation

onConfirm returns a promise: the action shows a spinner, Cancel and Escape wait, and the dialog closes when it resolves. Turn on the failure to see the inline error.

```tsx
import { ConfirmDialog } from "@/components/sheenui/alert-dialog/alert-dialog";
import { Button } from "@/components/sheenui/button/button";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Button, ConfirmDialog, useToast } from "@sheenui/theme";

// Your API client.
declare const api: { deleteProject(id: string): Promise<void> };

export function Example() {
  const toast = useToast();

  return (
    <ConfirmDialog
      trigger={<Button variant="danger">Delete project</Button>}
      title="Delete “Aurora”?"
      description="The project, its 24 deployments and every environment variable are removed for the whole team. This can’t be undone."
      confirmLabel="Delete project"
      labels={{ pending: "Deleting…" }}
      onConfirm={async () => {
        await api.deleteProject("aurora"); // throw to keep the dialog open with the message
        toast.success("Project deleted");
      }}
    />
  );
}
```

## Example 2 of 4: Type to confirm

For the irreversible: the action stays disabled until the name is typed exactly. Enter submits.

```tsx
import { ConfirmDialog } from "@/components/sheenui/alert-dialog/alert-dialog";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Button, ConfirmDialog } from "@sheenui/theme";

// Your API client.
declare const api: { deleteRepo(name: string): Promise<void> };

export function Example() {
  return (
    <ConfirmDialog
      trigger={<Button variant="glass">Delete repository</Button>}
      title="Delete sheenui/theme?"
      description="All issues, pull requests and 1,284 stars go with it. Forks are not deleted."
      confirmationText="sheenui/theme"
      confirmLabel="Delete this repository"
      onConfirm={() => api.deleteRepo("sheenui/theme")}
    />
  );
}
```

## Example 3 of 4: useConfirm()

Ask from any event handler and await the answer: true once the action has finished, false if dismissed. One dialog serves the whole list. After a key is revoked, focus moves to the next row's Revoke button (or to Restore once the list is empty), never to the page; pass finalFocus to choose another target.

```tsx
import { useState } from "react";
import { useConfirm } from "@/components/sheenui/alert-dialog/alert-dialog";
// Package build (after the first npm release, or a packed tarball): import { useConfirm } from "@sheenui/theme";

type ApiKey = { id: string; name: string; hint: string };

// Your API client.
declare const api: { revoke(id: string): Promise<void> };

export function Example() {
  const [confirm, confirmDialog] = useConfirm();
  const [keys, setKeys] = useState<ApiKey[]>([{ id: "k1", name: "CI deploy", hint: "sk_live_…a41f" }]);

  async function revoke(key: ApiKey) {
    const ok = await confirm({
      tone: "warning",
      title: `Revoke “${key.name}”?`,
      description: `Apps using ${key.hint} stop working immediately.`,
      confirmLabel: "Revoke key",
      onConfirm: () => api.revoke(key.id),
      // Optional: focus goes to the same spot in the list by default once the row is removed.
      // finalFocus: newKeyButtonRef,
    });
    if (ok) setKeys((list) => list.filter((k) => k.id !== key.id));
  }

  return (
    <>
      {keys.map((key) => (
        <button key={key.id} type="button" onClick={() => revoke(key)}>
          Revoke {key.name}
        </button>
      ))}
      {confirmDialog}
    </>
  );
}
```

## Example 4 of 4: Composed from parts

Build your own layout from the pieces. tone sets the icon and the action's color (danger → danger button).

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/sheenui/alert-dialog/parts/icons-content";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Button } from "@sheenui/theme";

const discard = () => console.log("discarded");

export function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="glass" />}>Close editor</AlertDialogTrigger>
      <AlertDialogContent tone="warning">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>You edited 3 fields in “Billing details”. Leaving now loses those edits.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={discard}>Discard changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space | Open it from the trigger. |
| Tab / Shift + Tab | Cycle inside; focus is trapped. |
| Escape | Dismiss it (blocked while the action runs) and return focus to the trigger. |
| Enter | In a type-to-confirm field, submit once the text matches. |

## Accessibility

- role="alertdialog" named by the title and described by the description; the page behind is inert.
- Initial focus lands on Cancel for danger and warning tones (the safe choice), on the action for info, or on the type-to-confirm field.
- While pending, aria-busy and a polite status announce it; errors use role="alert". The tone icon is decorative, so the title carries the meaning.
- If the trigger was removed (a deleted row), focus lands on the same spot in the list.

## All exports on this page

- AlertDialog — Root of an alert dialog: holds the open state and wires the trigger, popup and buttons together.
- AlertDialogAction — The confirming action.
- AlertDialogCancel — Closes the dialog without doing anything.
- AlertDialogClose — Any element inside the dialog that closes it when pressed (Base UI AlertDialog.Close).
- AlertDialogContent — The dialog panel: portal, dimmed scrim and a glass popup.
- AlertDialogDescription — Supporting text under the title (Base UI AlertDialog.Description).
- AlertDialogFooter — Buttons row: stacked full-width on phones (action on top, in thumb reach), a right-aligned row from sm.
- AlertDialogHeader — Icon + title + description.
- AlertDialogIcon — The tone icon in a soft tinted disc.
- AlertDialogTitle — The dialog's name (Base UI AlertDialog.Title, an <h2>).
- AlertDialogTrigger — The button that opens an AlertDialog (Base UI AlertDialog.Trigger).
- ConfirmDialog — A complete confirmation dialog in one component: tone icon, title, description, Cancel and the action, a loading state while an async onConfirm runs.
- createAlertDialogHandle — Connects an AlertDialog to triggers rendered elsewhere (e.g.
- defaultAlertLabels — The English AlertLabels used when labels is omitted; a partial labels prop is merged over it.
- defaultConfirmDialogLabels — The English strings of ConfirmDialog (Confirm, Cancel, Working…, a generic error, the type-to-confirm prompt).
- useConfirm — Ask from any event handler and await the answer: const [confirm, confirmDialog] = useConfirm().


## When to use the alert dialog

- Use it as a delete confirmation modal before deleting a project, revoking an API key or discarding unsaved changes, where the person must choose because an outside click will not dismiss it, only nudge the panel.
- Use ConfirmDialog when you want the whole thing prebuilt: icon, title, description, Cancel and action, a loading state while an async onConfirm runs, and inline errors if it throws.
- Use useConfirm in an event handler when awaiting the answer reads best, as in if (await confirm({ title: "Delete?" })), or add type-to-confirm for actions as serious as deleting an organization.
- Skip it when the content is informational or a form that people may dismiss freely; Dialog closes on an outside press, and Toast fits a quiet notice better than a blocking prompt.
- Pair it with Button for the trigger through the render prop, Toast to confirm that the action happened, and DataTable rows, where ConfirmDialog and useConfirm move focus to the matching control in the neighboring row after a delete.


## Frequently asked questions

### What is the difference between an alert dialog and a dialog in React?

Alert dialogs use role="alertdialog" and do not close on an outside press; the panel nudges instead so the click is not silently ignored. A regular Dialog is dismissable. Focus is trapped, the page behind is inert, and Escape still closes it.

### Where does focus go when the alert dialog opens?

For danger and warning tones, Cancel is focused first as the safe choice; for info, the action is. With type-to-confirm, the text field gets focus. Focus returns to the trigger on close, and if confirming removes the trigger, ConfirmDialog and useConfirm move it to the matching control in the row that takes its place, or the row before.

### How do I handle async work in the confirm button?

Return a promise from onConfirm on ConfirmDialog. The action button shows a loading state, the dialog stays open while it runs, and a thrown error appears inline with a shake. On the composable parts, set the action's close behavior off and use its loading prop yourself.

### Can I open one alert dialog from several triggers?

Yes. Create a handle with createAlertDialogHandle and pass it to AlertDialog and to triggers rendered elsewhere. The tone prop is danger, warning or info. It is built on Base UI AlertDialog; under reduced motion the popup only fades, with no spring.


## Related pages

- [Command palette (⌘K)](https://lokendra-builds.github.io/sheenui/overlays/command-palette)
- [Context menu](https://lokendra-builds.github.io/sheenui/overlays/context-menu)
- [Drawer / Sheet](https://lokendra-builds.github.io/sheenui/overlays/drawer)
- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)
- [Hover card](https://lokendra-builds.github.io/sheenui/overlays/hover-card)
- [Kbd](https://lokendra-builds.github.io/sheenui/overlays/kbd)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
