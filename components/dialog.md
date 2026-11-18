Canonical: https://lokendra-builds.github.io/sheenui/components/dialog

# Animated React Modal Dialog with Glass Effect

URL: https://lokendra-builds.github.io/sheenui/components/dialog
Sidebar name: Dialog

A glassmorphism React modal dialog that springs in with Motion. Focus trap, Escape to close and focus return come from Base UI. Tailwind CSS v4, MIT.

What it is: A strong-glass React modal dialog that springs in with Motion, with focus trapping, Escape to close and focus return handled by Base UI.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/dialog.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Dialog

Files to copy from `theme/src/`:

- `components/dialog/`
- `components/drawer/parts/sheet.tsx`
- `hooks/{use-latest.ts, use-media-query.ts}`
- `lib/{cn.ts, form.ts, modal-flag.ts, popup-motion.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: dialog. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/sheenui/dialog/dialog";
import { Input } from "@/components/sheenui/input/input";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use button, input, toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/input.json https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, useToast } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| mobile | MobilePresentation | "popup" | How the window opens on a phone-width screen (max-width: 640px): "popup" is the usual centred window; "sheet" is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh and home-indicator padding. Focus is trapped and returned and Escape closes in both. |
| Dialog open / defaultOpen | boolean | false | Controlled or uncontrolled open state. |
| Dialog onOpenChange | (open) => void | optional, no default | Called when the dialog opens or closes. |
| DialogTrigger / DialogClose render | ReactElement | optional, no default | Render as your own element, e.g. render={<Button />}. |
| DialogContent initialFocus / finalFocus | ref \| function \| boolean | first control / trigger | Where focus goes when the dialog opens and closes (Base UI). |

## DialogContent props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | optional, no default | The dialog body: usually DialogHeader, your content and DialogFooter. |
| showClose | boolean | true | Show the × button in the top-right corner. |
| labels | Partial<DialogLabels> | defaultDialogLabels | Translate the × button: { close: "Schließen" }. Every other string, for translation: labels={{ close: "…" }}; omitted keys keep the English of defaultDialogLabels. Its only key is listed in the key table under the props table. |
| stateLight | boolean | false | Lights the open window with a soft accent glow: a lit edge and a light pool on the glass's own layer (data-state="on"; set data-state to "working", "success", "warning" or "error" to change it). Off with reduced transparency and forced colours. The window scrolls, so its outer aura is clipped: the glow reads inside the edge. |
| container | HTMLElement \| ShadowRoot \| RefObject<HTMLElement \| ShadowRoot \| null> \| null | the end of document.body | Where the window is portalled. Pass an element to keep it inside a region (a stage, a preview) instead of the end of the body. |
| backdrop | boolean | true | Render the dimmed scrim behind the window. Turn it off for a non-modal dialog (modal={false} on Dialog), where the page stays usable. |

## Example 1 of 3: Edit profile

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/sheenui/dialog/dialog";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input } from "@sheenui/theme";

export function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes are saved to your account.</DialogDescription>
        </DialogHeader>
        <Input label="Name" defaultValue="Ada Lovelace" />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Example 2 of 3: Controlled, with a form

Open state lives in your component, so any button (or code) can open it and a successful submit can close it.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/sheenui/dialog/dialog";
import { Input } from "@/components/sheenui/input/input";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, useToast } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite a teammate</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join the workspace.</DialogDescription>
          </DialogHeader>
          <form
            id="invite-form"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              toast.success("Invitation sent");
            }}
          >
            <Input label="Email" type="email" required placeholder="name@example.com" />
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" form="invite-form">Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Example 3 of 3: Bottom sheet on phones

mobile='sheet' presents the dialog as a bottom sheet under 640px wide: full width, a drag handle you can swipe down, content scrolling inside a 85dvh cap, safe-area padding. Escape, the close button and focus return work as before. The default, 'popup', keeps the centred window. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/sheenui/dialog/dialog";
// Package build (after the first npm release, or a packed tarball): import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Dialog mobile="sheet">
      <DialogTrigger render={<Button>Share</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this file</DialogTitle>
          <DialogDescription>Anyone with the link can view it.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space | Open it from the trigger; focus moves inside. |
| Tab / Shift + Tab | Cycle through the controls inside; focus cannot leave while it is open. |
| Escape | Close it and return focus to the trigger. |

## Accessibility

- Built on Base UI's Dialog: role="dialog", named by DialogTitle and described by DialogDescription; the page behind is inert while it is open.
- Focus is trapped, starts on the first control (or initialFocus) and returns to the trigger on close.
- Always render a DialogTitle; showClose adds a labeled close button. Under reduced motion the dialog only fades.

## All exports on this page

- Dialog — Glass dialog: a modal window that blocks the page until the person answers or dismisses it.
- DialogClose — A button inside the dialog that closes it (a "Cancel" or "Done" action in DialogFooter).
- DialogContent — The glass window of a Dialog, portalled to the end of the body with a dimmed scrim behind it.
- DialogDescription — Muted helper text under the title.
- DialogFooter — Layout wrapper for the dialog's actions: a column on phones (primary action last in the DOM, so it is first on screen) and a right-aligned row from sm up.
- DialogHeader — Layout wrapper for DialogTitle and DialogDescription.
- DialogTitle — The dialog's heading.
- DialogTrigger — The element that opens a Dialog.
- defaultDialogLabels — English defaults of DialogLabels.


## When to use Dialog

- Use Dialog as a glass modal for a short form that blocks the page, such as renaming a project or inviting a teammate, where the person finishes or cancels before going back to the page. Use it as an animated modal in React whenever the content needs the person's full attention.
- Use it for a details view opened from a table row or a card, with DialogTitle and DialogDescription naming and describing it for screen readers.
- Use DialogFooter with DialogClose for Cancel and Save actions, and keep the corner close button on with showClose unless the footer already offers a clear exit.
- Skip it when the person must answer a destructive question, where AlertDialog fits better, or when the content is a side panel you want next to the page, where Drawer fits better.
- Pair it with Button through the render prop on DialogTrigger, Input and Field for the form inside, and Toast to confirm the result after the dialog closes.


## Frequently asked questions

### How do I build a React modal dialog with SheenUI?

Compose Dialog with DialogTrigger and DialogContent, then DialogHeader, DialogTitle, DialogDescription and DialogFooter inside. Dialog holds open, defaultOpen and onOpenChange and renders no element. It wraps Base UI Dialog, so the portal, focus handling and scroll lock are already done.

### How does the dialog handle keyboard focus?

Enter or Space on the trigger opens it and focus moves to the first control inside. Tab and Shift+Tab stay in the dialog, Escape or a click on the scrim closes it, and focus returns to the trigger. The page behind is inert and its scroll is locked.

### Do I have to include a title?

Yes, always render one. DialogTitle is an h2 and the dialog's accessible name, with aria-labelledby wired for you; DialogDescription gives aria-describedby. If the design has no visible heading, add className sr-only to the title so it stays available to assistive technology.

### How do I change the size or hide the close button?

DialogContent is centered, at most 28rem wide and never taller than the viewport; it scrolls inside. Override width with className. Set showClose to false to remove the corner button, and use labels to translate its aria-label, which is Close by default.


## Related pages

- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Drawer / Sheet](https://lokendra-builds.github.io/sheenui/overlays/drawer)
- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [OTP input](https://lokendra-builds.github.io/sheenui/components/otp-input)

### Guides that cover it

- [Install SheenUI Glass Components in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)
- [Base UI vs Radix UI for React in 2026](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix)
- [Best Glassmorphism React Libraries (2026)](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries)
- [shadcn Alternatives with Animation: Nine Libraries Compared (2026)](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives)
- [Glassmorphism UI Prompts for AI Coding Agents](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
