Canonical: https://lokendra-builds.github.io/sheenui/components/toast

# React Toast Notifications: Stack & Swipe

URL: https://lokendra-builds.github.io/sheenui/components/toast
Sidebar name: Toast

Glass React toast notifications that stack, fan out on hover and swipe away, in any corner. Screen readers announce them. Motion + Tailwind v4, MIT.

What it is: A React toast is a glass notification that stacks, fans out on hover and can be swiped away, announced automatically to screen readers.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Toast

Files to copy from `theme/src/`:

- `components/toast/`
- `components/spinner/`
- `hooks/{use-direction.ts, use-media-query.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: toast. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ToastProvider, useToast } from "@/components/sheenui/toast/toast";
import { Toaster } from "@/components/sheenui/toast/toaster";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Toaster, ToastProvider, useToast } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| viewportReady | boolean | true | Set to false while the Toaster is lazy-loaded: toasts raised meanwhile are held (their timer has not started) and shown, in order, once this turns true, which is when the Toaster has mounted. |
| onViewportNeeded | (() => void) | undefined | Called when a toast is held because the viewport is not ready, so the app can start loading the Toaster. |
| position | ToastPositionProp | "top-right" | Where the stack sits. Top positions slide in from above and stack downwards; bottom positions slide up and stack upwards. On phones every position spans the screen width (minus 16px gutters), so only top / bottom matters there. "top-left" and the other left / right names are physical; "top-start", "top-end", "bottom-start" and "bottom-end" follow the text direction (start is the left corner in ltr, the right corner in rtl). |
| className | string | optional, no default | Extra classes for the viewport (the fixed element that holds the stack). |
| container | HTMLElement \| null | the page (document.body, fixed to the screen) | Render the stack inside this element instead of the page: the viewport turns absolute and sits in the corner of the container (give it position: relative), so a demo or a panel can host its own toasts next to what triggers them. |
| onlyPositioned | boolean | false | Show only toasts that were given this position option (a second Toaster for per-toast positions). |
| labels | Partial<ToasterLabels> | defaultToasterLabels | Visible-to-assistive-tech text of the toasts. Translate it here; dismiss is the accessible name of each toast's × button. Every other string, for translation: labels={{ dismiss: "…" }}; omitted keys keep the English of defaultToasterLabels. All 4 keys of ToasterLabels are listed in the key table under the props table. |
| ToastProvider timeout | number (ms) | 5000 | How long a toast stays up. 0 keeps it until dismissed. |
| ToastProvider limit | number | 3 | How many toasts show at once; older ones are hidden, not dropped. |
| <Toaster /> | component | optional, no default | Renders the stack. Place it once, inside the provider. |
| useToast() | { info, success, warning, error, loading, promise, update, dismiss } | optional, no default | info / success / warning / error / loading take (title, description?, options?) and return the toast id. |
| options | ToastOptions | optional, no default | id, duration (ms; 0 or persistent keeps it; a toast with an action stays until dismissed), action ({ label, onClick }), position (per toast, shown by a Toaster with onlyPositioned), priority, onClose. |
| promise | (promise, { loading, success, error }, options?) => Promise | optional, no default | One toast that shows loading, then success or error; success and error may be functions of the result. |
| update | (id: string, changes: ToastUpdate) => void | optional, no default | Change a showing toast: type, title, description, duration, action. |
| dismiss | (id?: string) => void | optional, no default | Close one toast by id, or all of them when called without one. |

## Example 1 of 3: Position

Pick an edge and a side, then stack a few. The newest toast sits at the edge and older ones peek out behind it; hover the stack (or press F6) to fan it out. Swipe a toast up or right to dismiss it.

```tsx
import { ToastProvider, useToast } from "@/components/sheenui/toast/toast";
import { Toaster } from "@/components/sheenui/toast/toaster";
// Package build (after the first npm release, or a packed tarball): import { ToastProvider, Toaster, useToast } from "@sheenui/theme";

function App() {
  const toast = useToast();
  return <button onClick={() => toast.info("Hello from the toast stack")}>Show a toast</button>;
}

// Once, at the app root (top-right is the default):
export function Root() {
  return (
    <ToastProvider>
      <App />
      <Toaster />
    </ToastProvider>
  );
}
```

## Example 2 of 3: Types

Success, error and info each get their own icon color. Fire a few in a row to see them stack.

```tsx
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { useToast } from "@sheenui/theme";

const toast = useToast();
toast.success("Changes saved", "Your profile is up to date.");
toast.error("Upload failed", "The file is larger than 10 MB.");
toast.info("New version available");
toast.dismiss(); // close them all
```

## Example 3 of 3: Promise, action, persistent and update

toast.promise shows one toast that turns into success or error. An action adds a button such as Undo. persistent keeps a toast until it is dismissed, and update edits one by id.

```tsx
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  const save = () =>
    toast.promise(new Promise<string>((resolve) => setTimeout(() => resolve("report.pdf"), 1500)), {
      loading: "Saving report…",
      success: (name) => `${name} saved`,
      error: "Could not save",
    });

  const remove = () =>
    toast.warning("Message deleted", undefined, { action: { label: "Undo", onClick: () => toast.success("Restored") } });

  const upload = () => {
    const id = toast.loading("Uploading…", "0 of 3 files");
    setTimeout(() => toast.update(id, { type: "success", title: "Upload complete", description: "3 of 3 files", duration: 4000 }), 1800);
  };

  return (
    <>
      <button onClick={save}>Promise</button>
      <button onClick={remove}>Action</button>
      <button onClick={upload}>Update by id</button>
      <button onClick={() => toast.info("Stays until closed", undefined, { persistent: true })}>Persistent</button>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| F6 | Move focus to the toast region (announced once with every toast that has an action). Tab then reaches each Action and Dismiss button. |
| Tab | Reach each toast's Dismiss button while the stack is open. |
| Enter / Space | Dismiss the focused toast. |
| Escape | Dismiss the focused toast. |

## Accessibility

- Toasts are announced through a polite live region (errors too) and never steal focus. A toast with an action adds a hidden line to that announcement: "Press F6, then Tab to reach Undo."
- A toast with an action stays until it is dismissed (WCAG 2.2.1); an explicit duration on it is raised to at least 20 s. Timers also pause while a toast is hovered or focused. Still offer the same action somewhere in the page (an Undo in the list, say).
- The stack expands, and each toast pauses its timer, while it is hovered or holds focus, so there is time to read.
- Every action in a toast needs a visible label; swipe towards the nearest edge dismisses it on touch.

## All exports on this page

- ToastProvider — Glass toasts that stack, expand on hover and can be swiped away.
- Toaster — The fixed viewport that renders the toast stack.
- defaultToasterLabels — English defaults of ToasterLabels.
- useToast — const toast = useToast() returns the functions that show toasts.


## When to use Toast

- Use Toast as an animated toast in React for short, non-blocking feedback such as Saved, Copied to clipboard or Invite sent, where the person can keep working and the message needs no answer. If you are comparing a sonner alternative, SheenUI's Toast is called through the useToast hook and styled with the same glass tokens as the rest of the kit.
- Use toast.error for a failed background request, such as a sync that did not finish, with a description line explaining what to try next.
- Use position on Toaster for bottom-center on a mobile-first app or top-right on a desktop dashboard, remembering that on phones every position spans the screen width.
- Skip it when the message must stay visible next to a form or needs a decision. Use Alert for persistent inline messages and Dialog or AlertDialog when the person must answer.
- Pair it with Button actions that call useToast, Switch and Checkbox settings that save instantly, and DataTable bulk actions that finish in the background.


## Choosing between SheenUI Toast and Sonner

Sonner is a popular React toast library built around one global toast() call. SheenUI's toast is built on Base UI's Toast: you wrap the app in ToastProvider, render one Toaster and call useToast() for toast.success, toast.info, toast.error and toast.dismiss. Toasts stack, expand on hover or focus, can be swiped away, pause their timer while hovered or focused and fade under reduced motion. Choose Sonner if you want a global function and nothing to provide; choose this one if you want glass styling, Base UI's accessibility model and the source in your own repository.


## Frequently asked questions

### How do I show a toast notification in React with SheenUI?

Wrap your app in ToastProvider and render one Toaster inside it. In any component below, call const toast = useToast(), then toast.success(title, description), toast.info or toast.error. Titles and descriptions are React nodes, and toast.dismiss(id) closes one toast, or all of them with no id.

### How does keyboard and screen reader support work?

Toasts are announced politely through a live region and never steal focus. F6 moves focus to the viewport in Base UI, Tab reaches each Dismiss button, and Enter, Space or Escape closes the focused toast. The timer pauses while a toast is hovered or focused, giving time to read.

### Can I swipe a toast away?

Yes. Swipe toward the nearest edge on touch; on phones either side dismisses. The exit speed follows the swipe velocity, clamped to a range of 60 to 400 ms. Under reduced motion toasts fade only and the stack rearranges without sliding, though swiping still tracks your finger.

### How do I translate the toast Dismiss button?

Pass labels to Toaster with a dismiss string, such as labels={{ dismiss: "Fermer" }}. The default is Dismiss. The region itself is named by the label prop, Toast notifications by default (so it never clashes with a Notifications panel), so give each stack its own name if a page renders more than one.


## Related pages

- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Notification center](https://lokendra-builds.github.io/sheenui/blocks/notification-center)
- [Tooltip](https://lokendra-builds.github.io/sheenui/components/tooltip)
- [Alert](https://lokendra-builds.github.io/sheenui/components/alert)
- [Avatar](https://lokendra-builds.github.io/sheenui/components/avatar)
- [Badge](https://lokendra-builds.github.io/sheenui/components/badge)

### Guides that cover it

- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)
- [Framer Motion Is Now Motion](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
