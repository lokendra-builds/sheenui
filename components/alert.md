Canonical: https://lokendra-builds.github.io/sheenui/components/alert

# React Alert Component: Info, Success, Warning

URL: https://lokendra-builds.github.io/sheenui/components/alert
Sidebar name: Alert

A glass React alert component with info, success, warning and danger tones, an action and a dismiss button. Live-region roles, Tailwind CSS v4, MIT.

What it is: A glass React alert component for inline messages, with four tones, an optional action and a dismiss button, announced by screen readers.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/alert.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Alert

Files to copy from `theme/src/`:

- `components/alert/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, motion-props.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: alert. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Alert } from "@/components/sheenui/alert/alert";
import { Button } from "@/components/sheenui/button/button";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Alert, Button } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tone | "success" \| "warning" \| "danger" \| "info" | "info" | Sets the colour role and the default icon of the alert. |
| title | ReactNode | optional, no default | A bold first line shown above the message. |
| icon | ReactNode | optional, no default | Replaces the tone's icon; false hides it. |
| action | ReactNode | optional, no default | A button or link at the end, such as "Undo" or "Upgrade". Keep it a real control. |
| dismissible | boolean | false | Show a close button. The alert hides itself when it is pressed. |
| open | boolean | optional, no default | Whether the alert is shown (controlled). Pair with onOpenChange. |
| defaultOpen | boolean | true | Whether the alert starts shown when uncontrolled. |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called with false when the dismiss button is pressed. |
| labels | Partial<AlertLabels> | defaultAlertLabels | Every other string, for translation: labels={{ dismiss: "…" }}; omitted keys keep the English of defaultAlertLabels. Its only key is listed in the key table under the props table. |
| role | "alert" \| "status" \| "none" \| … | alert for warning and danger, otherwise status | Sets the live-region role that announces the alert. |

## Example 1 of 2: Four tones

Each tone has its own icon and tint. The words always say what happened.

```tsx
import { Alert } from "@/components/sheenui/alert/alert";
// Package build (after the first npm release, or a packed tarball): import { Alert } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert tone="info" title="A new version is available">Reload the page to get the latest features.</Alert>
      <Alert tone="success" title="Changes saved">Your profile is up to date.</Alert>
      <Alert tone="warning" title="Storage almost full">You have used 92% of your plan.</Alert>
      <Alert tone="danger" title="Payment failed">Your card was declined. Update it to keep your plan.</Alert>
    </div>
  );
}
```

## Example 2 of 2: Action and dismiss

Put a real button or link in action. dismissible adds a close button; open and onOpenChange let you control it.

```tsx
import { useState } from "react";
import { Alert } from "@/components/sheenui/alert/alert";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Alert, Button } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert
        tone="warning"
        title="Your trial ends in 3 days"
        action={<Button size="sm" variant="glass">Upgrade</Button>}
        dismissible
        open={open}
        onOpenChange={setOpen}
      >
        Add a payment method to keep your projects.
      </Alert>
      {!open && (
        <Button size="sm" variant="ghost" className="self-start" onClick={() => setOpen(true)}>
          Show the alert again
        </Button>
      )}
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Moves to the action and the dismiss button; the alert itself is not a tab stop. |
| Enter / Space | Activates the focused action or the dismiss button. |

## Accessibility

- Warning and danger use role="alert" (announced at once); info and success use role="status" (announced politely). Pass role="none" for a message that is already on screen at page load: the live demos on this page do, so navigating here does not read out five alerts (the code samples show normal use).
- The tone icon is decorative. The title and message carry the meaning, color is only a hint.
- The dismiss button is named by labels.dismiss, is 44px on touch screens, and has a visible focus ring.
- Text sits on a near-opaque tinted surface, so it keeps 4.5:1 over glass, photos and blobs in light and dark. Forced colors draw a CanvasText border.

## When to use Alert

- Use Alert as an inline message in React for a form-level error above a checkout form, such as a declined card, where the message must stay on screen next to the fields the person has to fix.
- Use it for a plan-limit banner at the top of a settings page, with an action button like Upgrade placed at the end of the row and a close button for people who have seen it.
- Use the success tone for a saved confirmation that should remain readable until the next navigation, instead of vanishing the way a toast does after a few seconds.
- Skip it when the message should disappear by itself after a short moment or must block the page until answered. Use Toast for the first case and Dialog or AlertDialog for the second.
- Pair it with Button for the action slot, Field or Input for the form it explains, and Toast for the lighter follow-up feedback once the problem is fixed.


## Frequently asked questions

### How do I make a dismissible alert in React with SheenUI?

Set the dismissible prop and the alert shows a close button and hides itself when pressed. For control, pass open and onOpenChange, which receives false on dismiss, or use defaultOpen when uncontrolled. The close button is named by labels.dismiss, so translate that string for other languages.

### Which ARIA role does the alert component use?

The role depends on the tone. Danger and warning default to role alert, which screen readers announce immediately. Info and success default to role status, announced politely. You can override it, and role none suits a message already on screen at page load so nothing is announced twice.

### Can I replace the icon or add a button to the alert?

Yes. The icon prop replaces the tone icon with your own node, and icon={false} hides it. The action prop takes a button or link rendered at the end of the alert. Keep it a real control, since the alert itself is not focusable and the action is a normal tab stop.

### Does the alert still animate when the user prefers reduced motion?

It simplifies. Normally the alert moves 6px into place while fading in and leaves with a shorter fade. When reduced motion is on, through the OS setting or the in-app toggle, it only fades with no vertical movement. The tinted surface is near opaque, so text keeps contrast on photos too.


## Related pages

- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Field and Label](https://lokendra-builds.github.io/sheenui/forms/field)
- [Avatar](https://lokendra-builds.github.io/sheenui/components/avatar)
- [Badge](https://lokendra-builds.github.io/sheenui/components/badge)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
