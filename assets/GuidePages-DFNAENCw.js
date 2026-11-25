import{t as e}from"./GuideArticle-DF_bVJVd.js";import"./guides-BOD_LkRi.js";import"./guide-images-CcTVZ8vq.js";import"./router-XutXN1EB.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "Framer Motion Examples for React: 12 Patterns | SheenUI"
description: "12 Framer Motion examples for React in Motion (motion/react): springs, shared layouts, scroll reveals, drag, tilt, reduced motion. Copy-paste code."
slug: "framer-motion-examples"
route: "/guides/framer-motion-examples"
targetKeyword: "framer motion examples"
secondaryKeywords: ["motion react examples", "motion for react tutorial", "framer motion tutorial"]
published: "2026-11-08"
updated: "2026-11-15"
relatedRoutes: ["/components/button", "/components/tabs", "/effects/morphing-dialog", "/components/toast", "/effects/number-ticker", "/effects/blur-in", "/effects/3d-tilt-card", "/effects/macos-dock"]
---

# Framer Motion Examples: 12 Animated React Patterns

These 12 Framer Motion examples use the library under its current name, Motion, imported from \`motion/react\`. Each one is a complete component you can paste into a React 19 project: press and hover springs, a sliding tab pill, a morphing dialog, a toast stack, a number ticker, blur-in text, scroll reveal, drag to dismiss, 3D tilt, a magnetic button, dock magnification and staggered menus. The TypeScript samples in this guide are compiled by the repo's checks: against the installed \`motion\` package, and against SheenUI where they use it.

They come from the animation layer of SheenUI, our glass component library, which uses Motion 14.14.0. Where SheenUI ships the polished version, we link to its docs page.

Basis: patterns from the animation layer of SheenUI, Motion's upgrade guide, and package facts dated in the text (8 Nov 2026). First published 8 Nov 2026, last revised 15 Nov 2026; a revision date marks an edit of the text, not a new test run of every example.

## Motion vs Framer Motion

It is the same library under a new name. The npm package is now \`motion\`, React code imports from \`motion/react\`, and the old \`framer-motion\` package is still published: on 8 Nov 2026 both were at version 14.10.1, and \`motion\` depends on \`framer-motion\` at that exact version (checked with \`npm view\`). The [upgrade guide](https://motion.dev/docs/react-upgrade-guide) says to uninstall \`framer-motion\`, install \`motion\` and change imports to \`motion/react\`. For the full migration, see [Framer Motion to Motion](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion).

## Setup with React 19 and Tailwind CSS v4

\`\`\`bash
npm install motion
\`\`\`

Motion 14.14.0 (the version these examples run on) declares peer dependencies on React 18 or 19. Tailwind CSS v4 needs no extra setup (SheenUI's [Tailwind CSS v4 setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4) covers the CSS if you use its components): the examples use ordinary utility classes, and Motion writes inline styles for transforms. To add the SheenUI versions of these effects to your app, follow the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation).

## 12 patterns

Patterns 5, 9, 10 and 11 are driven by motion values: the counter or pointer position is written straight to the element's style, so React does not re-render on every frame. That is a SheenUI rule for all JavaScript-driven motion (see the performance numbers in the README): motion values, not React state per frame. Patterns 1 to 4, 7 and 12 are declarative and need no extra care. Each example is a separate file, so you can take one without the others.

### 1. Press and hover springs

Springs tuned by \`visualDuration\` and \`bounce\` line up with how long the motion looks like it takes. A short, low-bounce spring suits controls:

\`\`\`tsx
import { motion } from "motion/react";

export function PressButton() {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", visualDuration: 0.22, bounce: 0.12 }}
      className="rounded-full border border-white/60 bg-white/55 px-5 py-2 backdrop-blur-xl"
    >
      Save
    </motion.button>
  );
}
\`\`\`

SheenUI's [glass button](https://lokendra-builds.github.io/sheenui/components/button) is built on the same idea; its motion tokens also define a stiff press spring so the release rebounds a little.

### 2. The shared-layout tab pill

Give the active tab a child with the same \`layoutId\` and Motion animates it from tab to tab:

\`\`\`tsx
import { motion } from "motion/react";
import { useState } from "react";

const tabs = ["Overview", "Usage", "Billing"];

export function PillTabs() {
  const [active, setActive] = useState(tabs[0]);
  return (
    <div role="tablist" className="inline-flex gap-1 rounded-full bg-white/40 p-1 backdrop-blur-xl">
      {tabs.map((tab) => (
        <button key={tab} role="tab" aria-selected={tab === active} onClick={() => setActive(tab)} className="relative rounded-full px-4 py-1.5 text-sm">
          {tab === active && (
            <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-white/80" transition={{ type: "spring", visualDuration: 0.22, bounce: 0.12 }} />
          )}
          <span className="relative">{tab}</span>
        </button>
      ))}
    </div>
  );
}
\`\`\`

This has no arrow-key navigation. The [Tabs component](https://lokendra-builds.github.io/sheenui/components/tabs) builds on Base UI Tabs for that.

### 3. The morphing dialog

A card and a dialog that share a \`layoutId\` look like one element growing. Wrap the dialog in \`AnimatePresence\` so it can animate out:

\`\`\`tsx
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function MorphingCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button layoutId="card" onClick={() => setOpen(true)} style={{ borderRadius: 16 }} className="bg-white/60 p-4 text-left">
        <motion.h3 layoutId="title">Release notes</motion.h3>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div layoutId="card" role="dialog" aria-modal="true" aria-labelledby="notes-title" style={{ borderRadius: 24 }} className="fixed inset-x-6 top-24 bg-white/90 p-6">
            <motion.h3 layoutId="title" id="notes-title">Release notes</motion.h3>
            <button onClick={() => setOpen(false)}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
\`\`\`

Motion's docs warn that layout animations use \`transform: scale()\` and can [distort children](https://motion.dev/docs/react-layout-animations); that is why the radius is set in \`style\`, where Motion corrects it. This sketch lacks a focus trap and Escape; the [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog) adds both.

### 4. The toast stack

\`mode="popLayout"\` lets the remaining toasts slide into the gap while one leaves:

\`\`\`tsx
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function Toasts() {
  const [ids, setIds] = useState<number[]>([]);
  return (
    <>
      <button onClick={() => setIds((list) => [...list, Date.now()])}>Notify</button>
      <ul aria-live="polite" className="fixed right-4 bottom-4 grid gap-2">
        <AnimatePresence mode="popLayout">
          {ids.map((id) => (
            <motion.li
              key={id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              className="rounded-xl bg-white/70 px-4 py-3 backdrop-blur-xl"
            >
              Saved <button onClick={() => setIds((list) => list.filter((x) => x !== id))}>Dismiss</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
\`\`\`

Note the exit: shorter than the entrance and no overshoot. See the [Toast component](https://lokendra-builds.github.io/sheenui/components/toast) for swipe and hover-to-fan.

### 5. The number ticker

Animate a motion value and render it directly. React never re-renders per frame:

\`\`\`tsx
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

export function Ticker({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => Math.round(v).toLocaleString("en"));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, to, value]);

  return <motion.span ref={ref} className="tabular-nums">{text}</motion.span>;
}
\`\`\`

### 6. Blur-in text

\`\`\`tsx
import { motion } from "motion/react";

export function BlurIn({ children }: { children: string }) {
  return (
    <motion.h2
      initial={{ opacity: 0.2, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.h2>
  );
}
\`\`\`

It starts at 0.2, not 0, on purpose; see the performance section. The [Blur in effect](https://lokendra-builds.github.io/sheenui/effects/blur-in) splits text by word.

### 7. Scroll reveal

\`\`\`tsx
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", visualDuration: 0.55, bounce: 0.18 }}
    >
      {children}
    </motion.section>
  );
}
\`\`\`

\`once: true\` stops it replaying and lets Motion release the observer.

### 8. Drag to dismiss

\`\`\`tsx
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function SwipeCard({ onDismiss, children }: { onDismiss: () => void; children: ReactNode }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      whileDrag={{ scale: 1.02 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 120 || Math.abs(info.velocity.x) > 600) onDismiss();
      }}
      className="touch-pan-y rounded-xl bg-white/70 p-4"
    >
      {children}
    </motion.div>
  );
}
\`\`\`

Dismissing on distance or velocity makes a quick flick count. Always offer a button too: dragging is not available to everyone.

### 9. 3D tilt

\`\`\`tsx
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const spring = { stiffness: 320, damping: 32, mass: 0.6 };

export function Tilt({ children }: { children: ReactNode }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-8, 8]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), spring);

  function move(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
  }

  return (
    <motion.div onPointerMove={move} onPointerLeave={() => { px.set(0.5); py.set(0.5); }} style={{ rotateX, rotateY, transformPerspective: 800 }}>
      {children}
    </motion.div>
  );
}
\`\`\`

SheenUI skips the 3D lean on phones: its source notes that a perspective transform on a blurred surface re-rasterizes the backdrop every frame. See the [Tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card).

### 10. The magnetic button

\`\`\`tsx
import { motion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const spring = { stiffness: 220, damping: 18, mass: 0.5 };
const pull = (offset: number) => Math.max(-6, Math.min(6, offset * 0.3));

export function Magnetic({ children }: { children: ReactNode }) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  function move(event: PointerEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    x.set(pull(event.clientX - (box.left + box.width / 2)));
    y.set(pull(event.clientY - (box.top + box.height / 2)));
  }

  return (
    <motion.button onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} style={{ x, y }} className="rounded-full bg-violet-600 px-6 py-3 text-white">
      {children}
    </motion.button>
  );
}
\`\`\`

Cap the pull (6 px here). A larger pull makes the target hard to hit.

### 11. Dock magnification

Scale icons by their distance from the pointer. \`scale\` is a transform, so it stays cheap, unlike animating \`width\`:

\`\`\`tsx
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function DockIcon({ mouseX, label }: { mouseX: MotionValue<number>; label: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? x - (box.left + box.width / 2) : Infinity;
  });
  const scale = useSpring(useTransform(distance, [-120, 0, 120], [1, 1.6, 1]), { stiffness: 320, damping: 32, mass: 0.6 });
  return <motion.button ref={ref} aria-label={label} style={{ scale, originY: 1 }} className="size-12 rounded-xl bg-white/60" />;
}

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  return (
    <div onPointerMove={(event) => mouseX.set(event.clientX)} onPointerLeave={() => mouseX.set(Infinity)} className="flex items-end gap-2">
      {["Mail", "Files", "Music"].map((label) => <DockIcon key={label} mouseX={mouseX} label={label} />)}
    </div>
  );
}
\`\`\`

The [Dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock) adds keyboard support and reduced-motion handling.

### 12. Staggered menus

\`delayChildren: stagger()\` offsets each child's entrance, as shown in the [stagger docs](https://motion.dev/docs/stagger):

\`\`\`tsx
import { motion, stagger } from "motion/react";

const list = { hidden: {}, visible: { transition: { delayChildren: stagger(0.05) } } };
const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

export function Menu({ items }: { items: string[] }) {
  return (
    <motion.ul variants={list} initial="hidden" animate="visible">
      {items.map((label) => (
        <motion.li key={label} variants={item}>{label}</motion.li>
      ))}
    </motion.ul>
  );
}
\`\`\`

Cap the total: SheenUI never spreads a group over more than 0.4 s, however many children there are.

## Choosing springs

Pick a spring by what is moving, not by feel on one screen. These are the four SheenUI uses, all defined by \`visualDuration\` (when the bulk of the motion is done) and \`bounce\`:

| Token | \`visualDuration\` | \`bounce\` | Use it for |
|---|---|---|---|
| \`snappy\` | 0.22 s | 0.12 | Controls: pills, toggles, indicators |
| \`smooth\` | 0.30 s | 0 | Overlays and layout reflow, no overshoot |
| \`gentle\` | 0.55 s | 0.18 | Large surfaces and reveals |
| \`bouncy\` | 0.40 s | 0.38 | Delight only: success, a badge count |

Two rules go with them. Exits are shorter than entrances and never overshoot (SheenUI uses 0.15 s with an ease-in curve). And a fade never springs: SheenUI's presets spring the transform and give the opacity its own short tween inside the same entrance.

If you would rather not copy numbers, the tokens and presets are exported, and they compile against \`motion/react\`:

\`\`\`tsx
import { motion } from "motion/react";
import { useSheenReducedMotion } from "@/components/sheenui/hooks/use-preferences";
import { fadeUp, hoverLift, stagger } from "@/components/sheenui/motion/presets";
// Package build (after the first npm release, or a packed tarball): import { fadeUp, hoverLift, stagger, useSheenReducedMotion } from "@sheenui/theme";

export function Cards({ items }: { items: string[] }) {
  const reduced = useSheenReducedMotion();
  const variants = reduced ? fadeUp.reduced : fadeUp.full;
  return (
    <motion.ul variants={stagger()} initial="hidden" animate="visible">
      {items.map((label) => (
        <motion.li key={label} variants={variants} {...(reduced ? {} : hoverLift)}>
          {label}
        </motion.li>
      ))}
    </motion.ul>
  );
}
\`\`\`

\`fadeUp.reduced\` keeps the opacity change and drops the movement, which is the reduced-motion rule from the next section in one line.

## Reduced motion done right

Motion has two tools. \`MotionConfig reducedMotion="user"\` follows the operating system setting and, per the [Motion docs](https://motion.dev/docs/react-accessibility), disables transform and layout animations while still animating values like opacity. \`useReducedMotion()\` returns a boolean for custom branches. Add an in-app toggle for people whose OS setting is not the whole story:

\`\`\`tsx
import { MotionConfig } from "motion/react";
import { useMotionPreference } from "@/components/sheenui/hooks/use-preferences";
// Package build (after the first npm release, or a packed tarball): import { useMotionPreference } from "@sheenui/theme";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [appReduced] = useMotionPreference();
  return <MotionConfig reducedMotion={appReduced ? "always" : "user"}>{children}</MotionConfig>;
}
\`\`\`

SheenUI's \`SheenMotionProvider\` wraps this and follows both settings live. Replace movement with a short fade, not with nothing.

## Performance: transform and opacity first

Motion's [performance docs](https://motion.dev/docs/performance) say that \`transform\` and \`opacity\` are cheapest to render in all browsers, and that animating layout is discouraged because it can take upwards of 100 ms. SheenUI's gate is stricter: only \`transform\` and \`opacity\` animate, apart from a short list of listed exceptions.

The \`opacity: 0\` trap matters on prerendered pages. Chromium [excludes elements with an opacity of 0](https://web.dev/articles/lcp) from Largest Contentful Paint, so a hero heading that fades in from 0 is not counted until it becomes visible. SheenUI's own SEO plan therefore says the H1 and subline must never start at \`opacity: 0\`.

## When not to animate

- Content people must read right away: skip entrance animations on the first headline.
- Long lists: animate the first screen, not all rows.
- Anything that repeats forever near text: it competes for attention and costs battery. Loops should pause when they leave the screen and when the tab is hidden.
- Layout animations on blurred surfaces: scaling a \`backdrop-filter\` element every frame is expensive.

## Frequently asked questions

### Is it Framer Motion or Motion?

Motion, with \`motion/react\` as the React import. Many tutorials still say Framer Motion and import from \`framer-motion\`, which still works because that package is still published.

### Do I need LazyMotion for these examples?

No. \`LazyMotion\` with the \`m\` component reduces bundle size; the [bundle size docs](https://motion.dev/docs/react-reduce-bundle-size) give about 5 kB initial instead of 43 kB for the \`motion\` component. See the migration guide above.

### Why does my stagger or exit animation not run?

Exit animations need the element's parent to be an \`AnimatePresence\` and the element to have a stable \`key\`. Variants need the same variant names on parent and children.

### Can I animate \`height: auto\`?

Yes, with the \`layout\` prop or by animating a wrapper, but measure the cost on blurred glass first.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`framer-motion-examples`,markdown:n})}export{i as default};