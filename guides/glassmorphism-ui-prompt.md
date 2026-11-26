Canonical: https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt

# Glassmorphism UI Prompt for Claude, Cursor & v0

URL: https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt
Sidebar name: Glassmorphism UI prompts

A glassmorphism UI prompt for Claude, Cursor and v0: copy-paste prompts, a rules file and a review checklist for accessible glass and Liquid Glass UI.

By Lokendra Singh Rathore. Published November 8, 2026, updated November 14, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Guides](https://lokendra-builds.github.io/sheenui/guides/) > Glassmorphism UI Prompts for AI Coding Agents

A good glassmorphism UI prompt does two things: it tells the agent what to build, and it forbids the shortcuts that make AI-generated glass look right in a screenshot and fail in use. This guide gives you copy-paste prompts for Claude, Cursor and v0, a rules file you can commit, a Liquid Glass variant and a checklist for reviewing what comes back.

Basis: the rules come from how we review glass UI in this repository, not from a test of any model; they name React 19.2+ and Tailwind CSS v4, the versions SheenUI requires. First published 8 Nov 2026, last revised 14 Nov 2026.

We make SheenUI, a glass component library. We did not benchmark any model, so nothing here claims that a prompt produces a certain score. The prompts encode rules we apply when reviewing glass UI, and the checklist shows how to verify the result instead of trusting it.

## Why AI-generated glass usually fails

These are failure modes to check for, not statistics. Each one follows from how the CSS works:

- **Contrast is never measured.** A model can pick a tint that looks fine over the sample background and fails over the brightest part of the real one. Contrast on glass has to be sampled from rendered pixels (see [the accessibility guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)).
- **Too much blur, applied everywhere.** Blur is a render pass per surface. Stacking many blurred cards, or blurring inside a blurred parent, costs frames and adds nothing ([performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)).
- **A wrapper with `opacity` or `filter`.** An ancestor with `opacity` below 1, a `filter` or a `mask` becomes a backdrop root, and the glass inside blurs nothing behind the page. A fade-in animation on a wrapper does this silently.
- **No fallbacks.** Reduced transparency, more contrast and forced colors need solid surfaces. Prompts that do not ask for them do not get them.
- **Invented CSS each time.** Without a spec, every component gets slightly different blur, tint and borders, and focus handling and keyboard behavior are rewritten from scratch.
- **Animating the wrong things.** `transition: all` and animated blur radius instead of transform and opacity.

## The prompt

Paste this into a chat tool, or use it as the task text in an agent. It works without any library: it states the recipe and the constraints. Replace the bracketed parts.

```text
Build [a pricing section / a settings dialog / a dashboard header] in React 19.2+ + TypeScript + Tailwind CSS v4.

Glass recipe (use exactly this, do not invent variants):
- Surface: background white/55 (light) or a dark smoked tint at 50% (dark), backdrop-filter: blur(20px) saturate(160%), 1px light border, inset top highlight.
- Three levels: level 1 = tint + border only (no blur), level 2 = cards (blur 20px), level 3 = dialogs and bars (blur 32px, most opaque).
- Always include the -webkit-backdrop-filter line.

Hard rules:
1. Text must reach 4.5:1 contrast (3:1 for large text) over the WORST part of the background, not the average. Control borders and focus rings must reach 3:1. Say how you checked.
2. Never put opacity, filter, mask or mix-blend-mode on a wrapper of glass. Animate the glass element itself.
3. No blur inside blur. At most 8 blurred surfaces visible at once.
4. Fallbacks, all of them: prefers-reduced-transparency: reduce, [data-transparency="reduced"], prefers-contrast: more and forced-colors: active must give a solid surface with a real border (CanvasText / Canvas in forced colors; no box-shadow-only edges).
5. Motion: only transform and opacity. Spring for entrances (about 0.2-0.5 s), shorter ease-in for exits, no overshoot on exit. Respect prefers-reduced-motion and replace movement with a short fade.
6. Semantics: real <button>, <a>, <dialog>-pattern components with focus trap and Escape; visible focus outline (outline, not box-shadow); touch targets at least 44px on touch screens.
7. Do not use glass for body text blocks, tables or forms with many fields. Use solid surfaces there.

Output: one file per component, no unused code, and a short list of how each rule was met.
```

Two details make it stronger. Name the real background (a gradient, an image, the color of the section above), because the model cannot reason about contrast without it. And ask for the verification, not just the code: "say how you checked" makes the agent state its assumptions, which you can then test.

## With SheenUI

If you use a component library, tell the agent to use it and not rewrite the glass. SheenUI is a copy-the-source library: its `@sheenui/theme` package is not on npm yet, so you add components with the shadcn CLI or copy the folders you need into your app (the README, the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks), the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation) and each docs page list them; tell the agent about the [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) too, since the glass tokens depend on it). The agent can then read real source, and that is where it helps: every exported component and hook carries a doc comment with its props, a compiling `@example`, and keyboard and accessibility notes, so an agent that opens `glass-card.tsx` learns the API from the file. A lint rule enforces the comment on every export, and `pnpm examples:check` compiles every example.

Here is what good output looks like with it. The agent should reach for `GlassCard`, `Dialog` and `Button` instead of writing CSS:

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/sheenui/dialog/dialog";
import { GlassCard, GlassCardContent } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, GlassCard, GlassCardContent } from "@sheenui/theme";

export function PlanCard() {
  return (
    <GlassCard level={2}>
      <GlassCardContent>
        <Dialog>
          <DialogTrigger render={<Button variant="glass" />}>Change plan</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change plan</DialogTitle>
              <DialogDescription>You will be billed the difference today.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </GlassCardContent>
    </GlassCard>
  );
}
```

See the [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card), [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog) and [Button](https://lokendra-builds.github.io/sheenui/components/button) pages for the props.

### A rules file the agent always reads

Put the stable rules in the file your tool loads on every task. Claude Code reads `CLAUDE.md` ([memory docs](https://code.claude.com/docs/en/memory)); Cursor reads `AGENTS.md` and `.cursor/rules/*.mdc` files with `description`, `globs` and `alwaysApply` frontmatter ([Cursor docs](https://cursor.com/docs/context/rules)). A short version for SheenUI:

```markdown
## UI rules (glass)

- Build UI from the glass components in `src/sheen` (barrel: `src/sheen/index.ts`). Read the component's source and its doc comment before using it. Do not write new glass CSS.
- Surfaces: `GlassCard level={1|2|3}`; dialogs are `Dialog`, never custom modals.
- At most 8 blurred surfaces in view; no glass nested inside glass blur; never `opacity`/`filter`/`mask` on a wrapper of glass.
- Liquid Glass (`LiquidGlass`): one hero element per view, never body text.
- Every glass surface must still work with reduced transparency, more contrast and forced colors. Do not remove these fallbacks.
- Motion: use `motion/react` with the presets and tokens in `src/sheen/motion`; only transform and opacity; respect reduced motion.
- Before finishing, list how contrast, keyboard and reduced-transparency behavior were checked.
```

For Cursor, the same text goes in `.cursor/rules/glass.mdc` below a frontmatter block such as `description: "Rules for glass UI"` and `alwaysApply: true`.

### The shadcn MCP server, the registry and llms.txt

The shadcn MCP server lets an assistant browse and install from registries listed in `components.json`; setup for Claude Code is `pnpm dlx shadcn@latest mcp init --client claude`, and Cursor, VS Code and Codex are supported ([shadcn MCP docs](https://ui.shadcn.com/docs/mcp)). Third-party registries are added by `@namespace` in `components.json`.

SheenUI's registry is built: 183 items (the shared theme, every component and chart, and the blocks) plus 5 install bundles, served at `https://lokendra-builds.github.io/sheenui/r/<name>.json` once the docs site is deployed. The shadcn CLI installs from those URLs (tested with shadcn 4.23.0 on Next.js and Vite, see the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)). We did not test the MCP server against it, and the registry is not listed under a `@namespace` yet, so with MCP you would give the agent the full URL. We have not published an agent skill either, so there is no `npx skills add` command to give you.

What does exist is a machine-readable index. The demo build writes `llms.txt` (an index of a few dozen KB, one line per page) and `llms-full.txt` (more than a megabyte, with each page's intro, files to copy, props and an example). Once the site is deployed they sit at the site root. The full file is too large for many contexts: give the agent `llms.txt` and let it fetch the pages it needs, or paste only the relevant sections.

## A Liquid Glass prompt

Liquid Glass needs different constraints, because its refraction only works in Chromium and costs more per area:

```text
Add Apple-style Liquid Glass to [one hero control] in React 19.2+ + Tailwind CSS v4.

Rules:
- Exactly one hero element per view (a pill button, a nav pill or a floating control). Never body text, never a card full of copy.
- Refraction is an SVG feDisplacementMap referenced from backdrop-filter and works only in Chromium. Detect the engine (do not use @supports: Safari and Firefox accept the declaration and draw nothing) and give every other browser frosted glass: backdrop-filter: blur(14px) saturate(160%).
- Size the displacement map to the element, redraw it on resize at most every 120 ms, never animate the element's size, only its scale.
- Turn refraction off, with a solid surface, for prefers-reduced-transparency, prefers-contrast: more and forced-colors: active.
- At most 3 refracting elements visible at once.
- Keep any text on a tinted ("regular") lens; a clear lens takes only an icon or one bold word.
Explain how the fallback was tested.
```

With SheenUI, the agent should use `LiquidGlass` (see the [Liquid glass page](https://lokendra-builds.github.io/sheenui/effects/liquid-glass) and [the CSS and React guide](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react)), which already does all of the above.

## A review checklist for AI output

Run these against whatever the agent produced:

1. **Contrast.** Sample the rendered pixels behind text, light and dark, with the script in the accessibility guide. Do not accept "I used white at 70%" as evidence.
2. **Fallbacks.** Emulate `prefers-reduced-transparency`, `prefers-contrast: more` and forced colors, and confirm the surface turns solid. The same guide has a Playwright script.
3. **Wrappers.** Search for `opacity`, `filter`, `mask` and `mix-blend-mode` on ancestors of glass.
4. **Budget.** Count blurred surfaces in view. More than 8, or glass inside glass blur, means rework.
5. **Keyboard.** Tab through everything; open and close each overlay with Escape; confirm a visible focus ring that is not a `box-shadow`.
6. **Motion.** Turn on reduced motion and confirm that movement becomes a fade.
7. **No invented API.** If the agent used a component or prop that does not exist in your copy of the source, it guessed. Type-check.

## Following up when the first result is wrong

Short, specific follow-ups work better than rewriting the prompt. Three that map to the checklist:

- "List every text element and its worst-case contrast over the brightest part of the background. Raise the tint on any under 4.5:1 and show the new numbers."
- "Find any ancestor of a glass element with opacity, filter, mask or mix-blend-mode, and move that property onto the glass element itself."
- "Add the reduced-transparency, more-contrast and forced-colors rules, and show the computed background and backdrop-filter under each."

Asking for the evidence each time keeps the agent honest, and it gives you something to paste into a code review.

## When not to rely on prompts

A prompt reduces repeated mistakes; it does not replace the checks above. Models change, and a prompt that works on one version may not on the next. Do not use glass prompts for data-dense screens: ask for solid surfaces there. And do not let an agent decide your brand colors: give it the tokens.

## Frequently asked questions

### Does this work in Cursor, Claude Code and v0?

The prompts are plain text, so they work in any chat or agent. For Claude Code and Cursor, move the stable rules into `CLAUDE.md`, `AGENTS.md` or a Cursor rules file so you do not paste them each time. We did not test v0 specifically.

### Can the agent install SheenUI with the shadcn CLI?

Yes, from the registry URL: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json` (works once the docs site is deployed). Next.js needs one CSS import changed to a relative path; the [install guide](https://lokendra-builds.github.io/sheenui/guides/install-frameworks) has the steps. You can also copy the source.

### Should I paste llms-full.txt into the prompt?

Usually not: it is more than a megabyte. Use `llms.txt` as an index and paste only the pages for the components you need.

### What is the minimum I should ask for?

Four lines: use the library's components, measure contrast on the worst background, provide solid fallbacks, and respect reduced motion.

---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
