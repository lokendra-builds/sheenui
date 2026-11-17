# @sheenui/theme

SheenUI: glassy, classy React components with motion. React 19.2+, Tailwind CSS v4, Base UI and Motion. Two style presets (Liquid Glass and Aurora Neon), light and dark, charts, chat, dashboards.

> `@sheenui/theme` is not published to npm yet. Until it is, install from a packed tarball (`pnpm pack`), or copy the source with the shadcn CLI (`npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/<name>.json`, see [the install guide](../docs/guides/install-frameworks.md)). The command below is what it will be.

```bash
pnpm add @sheenui/theme motion @base-ui/react
```

```css
/* app.css, after Tailwind */
@import "tailwindcss";
@import "@sheenui/theme/styles.css";
```

```tsx
import { Button } from "@sheenui/theme";

export const Hello = () => <Button>Hello, glass</Button>;
```

- Peer dependencies (your app installs them, so SheenUI shares one copy): `react` and `react-dom` 19.2 or newer (the components use `useEffectEvent`), `tailwindcss` 4.1 or newer, `@base-ui/react` 1.9 or newer and `motion` 14.10 or newer (two copies of Motion would break `MotionConfig`). `clsx`, `tailwind-merge` and `@tanstack/react-table` install with the package. Add the peers once: `pnpm add motion @base-ui/react`. Code samples on the docs pages also use icons from `lucide-react` (`pnpm add lucide-react`); the components themselves do not import it.
- ESM only, one file per module, `sideEffects: ["**/*.css"]`: a bundle that imports `Button` contains nothing else. Deep imports work too: `@sheenui/theme/components/button/button`.
- Every client component module starts with `"use client"` (pure-markup ones such as Badge and Skeleton do not need it), so it works in the Next.js App Router without extra config.
- Install steps for Next.js, Vite (React Router or TanStack Router) and "copy the files" (shadcn CLI): [docs/guides/install-frameworks.md](../docs/guides/install-frameworks.md).
- Docs, live examples and the component list: https://lokendra-builds.github.io/sheenui

## API conventions

Every component follows the same rules, so what you learn on one carries to the rest.

- **Controlled or not, your choice.** State comes as `value` / `defaultValue` / `onValueChange` (`open` / `defaultOpen` / `onOpenChange` for overlays). Pass `value` to control it, `defaultValue` to let the component own it. Switching between the two after mount logs a one-time warning in development.
- **Every string is a label.** Text a user reads or a screen reader announces lives in a `labels` object (`labels?: Partial<XLabels>`). Every labels type `<Name>Labels` has an exported `default<Name>Labels` (`SettingsPageLabels` -> `defaultSettingsPageLabels`) you can spread and translate; there is no English default anywhere else.

```tsx
import { DonutChart, defaultDonutChartLabels } from "@sheenui/theme";

<DonutChart data={data} labels={{ ...defaultDonutChartLabels, center: "Gesamt" }} />;
```

- **`data-slot` everywhere.** The root and every part carry a `data-slot` attribute (`data-slot="dialog-content"`), so you can style or test them without guessing class names.
- **`className` merges.** It goes on the outer element and is merged with `cn()` (clsx plus tailwind-merge), so your utilities win over the defaults. Parts that need their own classes take `<part>ClassName`.
- **`render` swaps the element.** Components that render an element take a `render` prop (an element or a function) to render a link, a router `Link` or your own component instead, keeping the behaviour and the accessibility attributes.
- **Direction-safe.** Layout uses logical properties and words (`start` / `end`, `inline-start`, `ps-*`), and key handling reads the resolved direction, so right-to-left pages flip without extra props.
- **Reduced motion and transparency.** `prefers-reduced-motion` turns flights and loops into short fades or stills; `prefers-reduced-transparency` swaps glass for solid surfaces; `forced-colors` and more-contrast keep every control visible. Ambient loops also pause off-screen and in hidden tabs.
- **One size and variant vocabulary.** `size` is `"sm" | "md" | "lg"`, `tone` names the semantic colour (each component lists its own tone set), `variant` is the visual form, and `headingLevel` sets the heading a component renders.

The full list, with the reasons, is in the docs under Foundations: https://lokendra-builds.github.io/sheenui/foundations

MIT licensed. Source: https://github.com/lokendra-builds/sheenui/tree/main/theme
