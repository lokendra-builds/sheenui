Canonical: https://lokendra-builds.github.io/sheenui/docs/dark-mode

# React Dark Mode with Tailwind v4 and Glass

URL: https://lokendra-builds.github.io/sheenui/docs/dark-mode
Sidebar name: Dark mode

Add dark mode to a React and Tailwind CSS v4 app with SheenUI: a data-theme switch, the system fallback, no flash on load and glass tuned for dark.

By Lokendra Singh Rathore. Published November 11, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Dark mode

React dark mode with Tailwind CSS in SheenUI is one data-theme attribute that the tokens, the dark variant and the useTheme hook all read.

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { useTheme } from "@/components/sheenui/hooks/use-preferences";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { useTheme } from "@sheenui/theme";
```

## Example: Switch the theme

useTheme returns the saved choice and a setter; this page's header toggle uses the same hook.

```tsx
import { useTheme } from "@/components/sheenui/hooks/use-preferences";
// Package build (after the first npm release, or a packed tarball): import { useTheme } from "@sheenui/theme";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Theme: {theme}</button>;
}
```

## How dark mode works in SheenUI

The theme is the data-theme attribute on the html element: light, dark, or absent for the system setting. The tokens read it through light-dark() and attribute selectors, and Tailwind's dark: variant is declared against the same attribute, so utility classes and tokens always agree. The useTheme hook writes the attribute, saves it and syncs other tabs.

Dark glass is tuned separately: less backdrop saturation, deeper tints and the same contrast targets (WCAG AA). Reduced transparency and the contrast preference override both themes with solid surfaces, so dark mode never weakens accessibility. Read [accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) for the checks.

Three things are worth testing in your own app: the first paint (no flash of the wrong theme), the system setting when nothing is saved, and the forced-colors and high-contrast modes, where glass becomes solid and borders become system colors. All three are handled by the theme, but custom components you add must use the tokens instead of fixed colors to inherit that behavior.

For first paint, inline sheenPreferenceScript in the head; the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) shows where. The [Next.js and Vite guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) covers the hydration warning.


## The attributes on the html element

Every preference is a data attribute on <html>, saved in localStorage under a sheen: key. CSS reacts to the attribute, so a preference needs no JavaScript after the first paint.

- data-theme: light or dark; absent follows the operating system.
- data-motion: reduced turns springs into short fades; absent is full motion.
- data-transparency: reduced makes every glass surface solid; absent is glass.
- data-glass: lite or full, the cheaper blur for slow devices.
- data-sheen-style: liquid (the default) or aurora, the two style presets.


## The dark variant in Tailwind CSS v4

Tailwind v4 reads dark: from the system setting unless you redefine it. The SheenUI styles already do that against data-theme; in a project that does not import them, declare the same variant yourself:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Then dark:bg-slate-900/50 follows the attribute that useTheme writes, and a plain @media (prefers-color-scheme) no longer decides. See the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) for the rest of the CSS.


## Colors in your own components

A custom component inherits dark mode when it takes its colors from tokens instead of writing dark: pairs. The semantic tokens (--sheen-bg, --sheen-fg, --sheen-border and the rest) are defined with light-dark(), and color-scheme follows data-theme, so one class resolves to a different value in each theme. Tailwind exposes them as bg-sheen-bg, text-sheen-fg, text-sheen-fg-muted and border-sheen-border; glass-1, glass-2 and glass-3 are the three glass levels, each with its own dark tint.

```tsx
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside className="glass-2 rounded-sheen-lg border border-sheen-border p-4 text-sheen-fg">
      <p className="text-sm text-sheen-fg-muted">{children}</p>
    </aside>
  );
}
```

That component needs no theme logic: switch data-theme and the tint, the border and both text colors change together.


## What the contrast targets are

The text tokens are measured in the browser against the worst case, the brightest backdrop blob peak under plain, glass-1 and glass-2 surfaces, in both themes: body and status text must reach 4.5:1, and focus rings and control edges 3:1. The numbers sit in the comment at the top of the token file. If you add your own accent or status color, check it the same way on a glass surface, not only on the flat page color.


## No flash of the wrong theme

A server-rendered page does not know the saved choice, so the first paint can show the wrong theme until React loads. Put sheenPreferenceScript inline in the head: it runs before first paint, copies the saved values onto the html element and falls back to the Liquid Glass preset when storage is unavailable. In a Next.js root layout:

```tsx
import { sheenPreferenceScript } from "@/components/sheenui/hooks/use-preferences";
// Package build (after the first npm release, or a packed tarball): import { sheenPreferenceScript } from "@sheenui/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-sheen-style="liquid" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: sheenPreferenceScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

suppressHydrationWarning is needed because the script changes the html element before React compares it with the server markup. In a Vite app, paste the script text into index.html.


## Frequently asked questions

### Where is the theme choice stored?

In localStorage under sheen:theme, as light or dark. System is the absence of a value, so the operating system's setting applies. The choice is synced across tabs.

### How do I avoid a flash of the wrong theme?

Inline sheenPreferenceScript in the head. It runs before first paint and sets data-theme, data-motion and data-sheen-style from localStorage; in Next.js add suppressHydrationWarning to the html element.

### Does the glass look the same in dark mode?

No, on purpose. Dark glass saturates the backdrop less (140 percent against 180 in light) because the dark blobs are already deep and more saturation would lower text contrast.

### Can I force one theme?

Yes. Call setTheme from the useTheme hook, or set data-theme on the html element yourself. Setting it removes the system fallback until you pass system again.

### How do I add a theme toggle with a system option?

Call setTheme with light, dark or system. System removes the data-theme attribute and the saved value, so the operating system's setting takes over again.


## Related pages

- [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4)
- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)
- [Accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)
- [Built on Base UI](https://lokendra-builds.github.io/sheenui/docs/base-ui)
- [Right-to-left and localisation](https://lokendra-builds.github.io/sheenui/docs/rtl)
- [About SheenUI](https://lokendra-builds.github.io/sheenui/about)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
