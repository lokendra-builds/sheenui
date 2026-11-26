import{t as e}from"./GuideArticle-BgNvfX9x.js";import"./guides-k3OSKJ-Y.js";import"./guide-images-DfUluOYJ.js";import"./router-KJTTT7HX.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "shadcn Glassmorphism: Glass Card, Dialog, Theme | SheenUI"
description: "shadcn glassmorphism in three ways: restyle the stock Card, Dialog and Button, retheme the CSS variables, or install glass components with the shadcn CLI."
slug: "shadcn-glassmorphism"
route: "/guides/shadcn-glassmorphism"
targetKeyword: "shadcn glassmorphism"
secondaryKeywords: ["shadcn glass theme", "glassmorphism shadcn ui", "shadcn glass card", "shadcn liquid glass"]
published: "2026-11-26"
updated: "2026-11-26"
relatedRoutes: ["/components/glass-card", "/components/dialog", "/components/button", "/docs/installation", "/docs/tailwind-v4"]
---

# shadcn Glassmorphism: Three Ways to Get a Glass UI

shadcn glassmorphism is a frosted-glass look (a translucent fill, a \`backdrop-filter\` blur and a light border) applied to shadcn/ui components. shadcn/ui has no glass theme of its own, so you get there in one of three ways: add Tailwind classes to the components you already have, change the shadcn theme variables so every component turns translucent, or install components that were built as glass from the start.

SheenUI is our own library, and it is the third way; the first two need nothing from us. For a library comparison instead of a how-to, read [shadcn alternatives](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives) and [best glassmorphism React libraries](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries).

Short answer, by effort:

1. Restyle a few components: add \`backdrop-blur-xl\`, a translucent fill and a light ring to a Card, a Dialog and a Button through \`className\`.
2. Change the theme: make \`--card\`, \`--popover\` and \`--border\` translucent in your CSS and add one blur rule, so every stock component follows.
3. Install glass components: \`npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json\`, which brings the tokens, the glass levels and the fallbacks with it.

Basis: the shadcn/ui documentation, its component registry and the npm registry, read on 26 Nov 2026 as the text says. Browser behavior and numbers come from our other guides, which cite MDN and our own measurements. First published 26 Nov 2026, last revised 26 Nov 2026; shadcn/ui changes often, so check the version you install.

## What you start from in a shadcn/ui project

Four facts about the stock setup decide how the glass is built, all read from the shadcn docs on 26 Nov 2026:

- Colors are CSS variables. The [theming page](https://ui.shadcn.com/docs/theming) lists token pairs such as \`background\`, \`card\`, \`popover\`, \`primary\`, \`muted\`, \`accent\`, \`border\`, \`input\` and \`ring\`, each surface token paired with a \`-foreground\` text token. Defaults are written in \`oklch()\`, defined under \`:root\` and \`.dark\`, and exposed to Tailwind through \`@theme inline\`.
- Tailwind v4 is the default for new projects. The [Tailwind v4 page](https://ui.shadcn.com/docs/tailwind-v4) says "Only new projects start with Tailwind v4 and React 19"; older projects keep working on v3.
- Every part carries a \`data-slot\` attribute, such as \`data-slot="card"\`, which plain CSS can select.
- New projects use Base UI. The July 2026 changelog entry "Base UI as the Default" says "New projects now use Base UI by default. Radix is still fully supported." The [Dialog page](https://ui.shadcn.com/docs/components/dialog) opens on a Base UI tab. The \`shadcn\` CLI package was at 4.23.1 on npm that day.

The code below follows the Base UI version of the component source (the \`base-nova\` style); the \`className\` overrides work the same on the Radix version.

## Way 1: restyle the stock components with Tailwind utilities

This is the fastest route and touches only the components you choose. Every shadcn/ui component merges your \`className\` over its own classes, so the glass classes win.

### A glass Card

The stock Card is \`bg-card\` with a \`ring-1\` outline and no blur. Put it over something colorful, give it a translucent fill, a blur and a light ring:

\`\`\`tsx external
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlanCard() {
  return (
    <Card className="bg-card/55 ring-white/40 shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150 dark:ring-white/15">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Up to 10 seats, billed monthly.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">$24</p>
      </CardContent>
    </Card>
  )
}
\`\`\`

\`bg-card/55\` works because Tailwind v4 mixes the opacity into the \`--card\` token. \`backdrop-saturate-150\` brings back some of the color that the blur washes out. Blur over a flat color shows nothing, so put a gradient or an image behind the card.

### A glass Dialog

The stock Dialog has an overlay (dimmed, with a light \`backdrop-blur-xs\` in the source we read) and a content panel. The panel takes \`className\` directly:

\`\`\`tsx external
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Invite</DialogTrigger>
      <DialogContent className="bg-popover/60 ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:ring-white/15 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>They get an email with a sign-in link.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-transparent">
          <Button>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
\`\`\`

\`DialogTrigger render={...}\` is the Base UI form; on the Radix version use \`asChild\`.

The overlay is rendered inside \`DialogContent\`, so a \`className\` cannot reach it. Because shadcn copies the file into your repo, edit it there. The stock line is \`bg-black/10 supports-backdrop-filter:backdrop-blur-xs\`; make the dim stronger and the blur a little larger, so the panel has something calm to sit on:

\`\`\`diff
-        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs ..."
+        "fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm ..."
\`\`\`

On Radix, the same edit goes on \`DialogOverlay\`. The stock footer has \`bg-muted/50\`, so we reset it to keep the panel one surface.

### A glass Button

The outline variant is the best base because it already has a border. A thin wrapper keeps the classes in one place:

\`\`\`tsx external
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

export function GlassButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={\`border-white/40 bg-white/30 backdrop-blur-md hover:bg-white/50 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20 \${className ?? ""}\`}
      {...props}
    />
  )
}
\`\`\`

Keep filled primary buttons opaque: a translucent primary button over a busy backdrop is the quickest way to fail contrast.

## Way 2: a glass theme through CSS variables

If most of your app should be glass, change the tokens once. Every stock component reads \`--card\`, \`--popover\` and \`--border\`, so alpha on those variables turns them all translucent without touching a component. Add this to the CSS file where shadcn defined its tokens (names are shadcn's, values are ours to tune):

\`\`\`css
:root {
  --background: oklch(0.96 0.02 260);
  --card: oklch(1 0 0 / 0.55);
  --popover: oklch(1 0 0 / 0.7);
  --border: oklch(1 0 0 / 0.5);
  --glass-blur: 20px;
  --glass-shadow: 0 8px 32px oklch(0.2 0.05 270 / 0.12);
}

.dark {
  --background: oklch(0.18 0.03 270);
  --card: oklch(0.28 0.03 270 / 0.45);
  --popover: oklch(0.28 0.03 270 / 0.6);
  --border: oklch(1 0 0 / 0.14);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 0.4);
}

@layer components {
  [data-slot="card"],
  [data-slot="dialog-content"],
  [data-slot="popover-content"] {
    backdrop-filter: blur(var(--glass-blur)) saturate(160%);
    box-shadow: var(--glass-shadow);
  }
}
\`\`\`

Four things set the look: fill alpha, a border lighter than the fill, the blur radius and the shadow. Dark mode needs its own values. The \`@layer components\` rule sits below Tailwind's utilities, so a one-off \`backdrop-blur-none\` on a single card still wins. Put a gradient or image on \`body\`, or there is nothing to blur.

Where Way 2 stops working:

- **Popovers over busy backdrops.** Menus and comboboxes show many short lines of text over whatever is behind them. Keep \`--popover\` more opaque than \`--card\`, as above, or make it solid.
- **Nested blur.** An element with \`backdrop-filter\` becomes a backdrop root, so a blurred child inside a blurred parent can only blur the parent's own fill, not the page behind. A Card inside a Card, or a sticky header inside a glass panel, gets a second blur that shows nothing and still costs GPU time. Blur the outer surface only.
- **Borders and inputs.** \`--border\` is used for every divider, and \`--input\` for field outlines. A near-white border on a light page disappears, and field outlines are UI component boundaries that WCAG 1.4.11 asks to reach 3:1 contrast. Leave \`--input\` solid.
- **Everything else that reads the tokens.** Charts, tables and sidebars change too; check each.

## Way 3: install ready glass components with the shadcn CLI

SheenUI is our own library: glass components built on Base UI, Tailwind CSS v4 and Motion, MIT licensed. The \`@sheenui/theme\` package is not on npm; it is \`private\` on purpose, so you install through the shadcn registry, which copies the source into your repo like any shadcn component.

The CLI documents \`add\` as taking a "name, url or local path to component" ([CLI docs](https://ui.shadcn.com/docs/cli)), so a registry item is just a URL:

\`\`\`bash
npx shadcn@latest init -d
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/dialog.json
\`\`\`

Real item names in the registry include \`glass-card\`, \`button\`, \`dialog\`, \`popover\`, \`navbar\`, \`liquid-glass\` (the refraction effect) and \`sheenui-theme\`, the shared base that every other item depends on (tokens, glass levels, motion, hooks and styles). Each item installs into \`components/sheenui/<item>/\`. There are also five install bundles that have no files of their own and only pull in existing items: \`components\`, \`charts\`, \`blocks\`, \`dashboards\` and \`all\`.

\`\`\`bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/components.json
\`\`\`

Using them looks like this. Imports follow the copied-files layout, and \`glass\` is a button variant:

\`\`\`tsx
import { Button } from "@/components/sheenui/button/button";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/sheenui/glass-card/glass-card";

export function PlanCard() {
  return (
    <GlassCard level={2}>
      <GlassCardHeader>
        <GlassCardTitle>Team plan</GlassCardTitle>
        <GlassCardDescription>Up to 10 seats, billed monthly.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <Button variant="glass">Choose plan</Button>
      </GlassCardContent>
    </GlassCard>
  );
}
\`\`\`

What you get that Ways 1 and 2 leave to you: three glass levels (1 for chips, 2 for cards, 3 for dialogs and bars), a Liquid Glass refraction effect in Chromium with a frosted fallback in Safari and Firefox, glass that turns solid under reduced transparency, more contrast and forced colors, and a cap of at most 8 blurred surfaces and 3 refraction lenses in view. The cost: a second component set next to shadcn/ui, a provider to mount once, and a CSS import the CLI appends (Next.js needs a relative path). The [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) has the tested steps, and the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) lists every item. Live examples: [Glass Card](https://lokendra-builds.github.io/sheenui/components/glass-card), [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog), [Button](https://lokendra-builds.github.io/sheenui/components/button) and the [Liquid Glass effect](https://lokendra-builds.github.io/sheenui/effects/liquid-glass).

## Rules that keep glass usable

These apply to all three ways.

1. **Check text contrast at the worst backdrop point.** WCAG asks for 4.5:1 for normal text and 3:1 for large text. On glass the background differs at every pixel, so measure the lightest and darkest spots behind the text, not the CSS color. The method is in [accessible glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism). If it fails, raise the fill opacity before you touch the text color.
2. **Ship a solid fallback.** Glass should become a solid surface for \`prefers-reduced-transparency\`, \`prefers-contrast: more\` and \`forced-colors\`. Chrome and Edge support the first from version 118, Firefox only behind a flag and Safari not at all, so also offer an in-app switch. One unlayered block covers Ways 1 and 2, because \`data-slot\` marks every shadcn part and unlayered CSS beats Tailwind's layered utilities:

\`\`\`css
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  [data-slot="card"],
  [data-slot="dialog-content"],
  [data-slot="popover-content"] {
    background-color: var(--background);
    backdrop-filter: none;
  }
}

@media (forced-colors: active) {
  [data-slot="card"],
  [data-slot="dialog-content"],
  [data-slot="popover-content"] {
    background-color: Canvas;
    border: 1px solid CanvasText;
    box-shadow: none;
    backdrop-filter: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  [data-slot="dialog-overlay"] {
    backdrop-filter: none;
  }
}
\`\`\`

3. **Keep a blur budget.** Cost grows with the area blurred and with how often the backdrop changes. In our measurement, 8 full-viewport blurred layers over a moving backdrop ran at 44 to 50 fps on an M1, 16 at 22 to 26 and 32 at 12 to 13, while the same layers over a static backdrop held 60. Twenty-four panels of 400 by 300 held 60. These are one machine's numbers; the [performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance) has the setup and limits. SheenUI caps itself at 8 blurred surfaces in view.
4. **Do not fade a wrapper that contains glass.** An ancestor with \`opacity\` below 1, a \`filter\`, a \`mask\` or a \`clip-path\` becomes a backdrop root and the blur stops there. Animate the glass element itself. This bites with shadcn's fade-in animations if you put them on a parent of a glass Card.
5. **Check focus rings.** Rings made from \`box-shadow\` vanish in forced colors, so check shadcn's \`ring\` utilities in Windows High Contrast.

## Which way to pick

| Situation | Restyle (Way 1) | Theme (Way 2) | Install (Way 3) |
|---|---|---|---|
| One glass card or dialog in a mostly flat app | Best fit | More than you need | More than you need |
| Whole app should feel like glass | Many repeated class lists | Best fit | Fits, adds a second set |
| You must keep one component set | Yes | Yes | No, two sets side by side |
| Safari and Firefox need a plan | You write it | You write it | Built in |
| Refraction (Liquid Glass) | No | No | \`liquid-glass\` item |
| Ongoing upkeep | Per component | One CSS block | Registry updates |


## Other shadcn-compatible glass libraries

SheenUI is not the only registry that installs glass through the shadcn CLI. liqui.design, Glassy UI and crenspire Glass UI each publish glass items, and they differ in primitives (Base UI or Radix), refraction support and how they handle Safari. We compare them on checked data, with licenses, install commands and fallbacks, in [best glassmorphism React libraries](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries). The broader list of shadcn alternatives is in [shadcn alternatives](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives). For the build-it-yourself version, see the [glassmorphism React tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial).

## Frequently asked questions

### Does shadcn/ui have a glass theme?

No. As of 26 Nov 2026 the shadcn/ui docs describe theming through CSS variables with a flat default, and no glass preset. A glass theme is something you add: translucent \`--card\`, \`--popover\` and \`--border\` values plus a \`backdrop-filter\` rule (Way 2), or glass classes on individual components (Way 1).

### How do I add glassmorphism to a shadcn card?

Pass glass utilities through \`className\`: \`bg-card/55 ring-white/40 backdrop-blur-xl backdrop-saturate-150\`, as in the Card sample above, and put something colorful behind it. Blur over a flat background shows nothing. Then add the solid fallback for reduced transparency.

### Does backdrop-filter work with shadcn dialogs?

Yes. The stock Dialog already blurs its overlay with \`backdrop-blur-xs\` in the source we read, and the content panel accepts \`backdrop-blur-*\` classes. The things that break it are an ancestor with \`opacity\` below 1, a \`filter\`, a \`mask\` or a \`clip-path\`, which stop the blur, and a blurred element nested inside another blurred element.

### How do I make shadcn liquid glass?

Liquid Glass adds refraction to frosted glass by bending the backdrop with an SVG \`feDisplacementMap\` inside \`backdrop-filter\`. That works in Chromium only, so Safari and Firefox need a frosted fallback. SheenUI's \`liquid-glass\` registry item does this; the [Liquid Glass guide](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react) explains the technique.

### Is glass in a shadcn app accessible?

It can be, if text meets contrast over the worst backdrop point and the glass turns solid for reduced transparency, more contrast and forced colors. Dense data screens and long forms are better left flat.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`shadcn-glassmorphism`,markdown:n})}export{i as default};