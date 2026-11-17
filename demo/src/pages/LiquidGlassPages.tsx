import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { motion, useMotionValue } from "motion/react";
import { Badge } from "@sheenui/theme";
import { Button } from "@sheenui/theme";
import { GlassCard } from "@sheenui/theme";
import { Input } from "@sheenui/theme";
import { Switch } from "@sheenui/theme";
import { useSheenReducedMotion } from "@sheenui/theme";
import { LiquidGlass, supportsLiquidGlass } from "@sheenui/theme";
import { SpotlightCard, SpotlightGroup } from "@sheenui/theme";
import { BorderBeam } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
// The library's own clamp is internal (not in the public barrel), so the docs page takes it from the source.
import { clamp } from "../../../theme/src/lib/math";
import * as PROPS from "../generated/component-props";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { LiquidGlassScene as LiquidGlassSceneData } from "../layout/ShowcaseStage.liquid-glass";
import { LiquidGlassScene } from "../layout/ShowcaseStage.liquid-glass.scene";
import type { SpotlightCardScene as SpotlightCardSceneData } from "../layout/ShowcaseStage.spotlight-card";
import { SpotlightCardScene } from "../layout/ShowcaseStage.spotlight-card.scene";
import type { BorderBeamScene as BorderBeamSceneData } from "../layout/ShowcaseStage.border-beam";
import { BorderBeamScene } from "../layout/ShowcaseStage.border-beam.scene";

/* =====================================================================
 * Liquid glass
 * ===================================================================== */

/**
 * Crisp, high-contrast artwork for the lens to bend: hard-edged shapes, fine lines and big
 * type show refraction far better than soft blobs. Decorative (aria-hidden).
 */
function LensArtwork({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className ?? ""}`}>
      <div className="absolute inset-0 [background:conic-gradient(from_210deg_at_70%_35%,var(--sheen-chart-1),var(--sheen-chart-5),var(--sheen-chart-2),var(--sheen-chart-4),var(--sheen-chart-3),var(--sheen-chart-7),var(--sheen-chart-1))]" />
      {/* Fine horizontal rules: they visibly bend at the lens rim. */}
      <div className="absolute inset-x-0 top-[8%] h-[34%] [background:repeating-linear-gradient(0deg,color-mix(in_oklab,var(--sheen-ink-0)_75%,transparent)_0_2px,transparent_2px_12px)]" />
      <div className="absolute top-[52%] -start-10 size-48 rounded-full bg-sheen-surface" />
      <div className="absolute top-[58%] start-[12%] size-24 rounded-full border-[14px] border-[var(--sheen-chart-1)]" />
      <div className="absolute end-[6%] bottom-[10%] size-32 rotate-12 rounded-sheen-lg [background:repeating-linear-gradient(45deg,var(--sheen-ink-900)_0_6px,var(--sheen-ink-0)_6px_12px)]" />
      <div className="absolute inset-x-0 top-[44%] -translate-y-1/2 text-center font-black leading-none tracking-tighter text-[var(--sheen-ink-900)] text-[clamp(3.5rem,14vw,9rem)]">
        Liquid
      </div>
      <div className="absolute end-[24%] bottom-[8%] h-24 w-40 [background-image:radial-gradient(circle,var(--sheen-ink-0)_0_2.5px,transparent_3px)] [background-size:14px_14px]" />
    </div>
  );
}

/** The engine check, read once (false while rendering on the server). */
function useLiquidGlassSupport() {
  return useSyncExternalStore(
    () => () => undefined,
    supportsLiquidGlass,
    () => false,
  );
}

function DraggableLens() {
  const areaRef = useRef<HTMLDivElement>(null);
  const reduced = useSheenReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Arrow keys move the lens (Shift for bigger steps), kept inside the artwork.
  function nudge(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Partial<Record<string, [number, number]>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    const area = areaRef.current;
    if (!move || !area) return;
    event.preventDefault();
    // Layout box (offsets ignore the drag transform) + motion values: exact even when keys repeat faster than frames.
    const lens = event.currentTarget;
    const step = event.shiftKey ? 64 : 16;
    x.set(clamp(x.get() + move[0] * step, -lens.offsetLeft, area.clientWidth - lens.offsetLeft - lens.offsetWidth));
    y.set(clamp(y.get() + move[1] * step, -lens.offsetTop, area.clientHeight - lens.offsetTop - lens.offsetHeight));
  }

  return (
    <div ref={areaRef} className="relative h-80 w-full sm:h-96">
      <LensArtwork />
      <LiquidGlass
        shape="circle"
        variant="clear"
        aberration={0.6}
        render={
          <motion.div
            drag
            dragConstraints={areaRef}
            dragElastic={0.12}
            dragMomentum={!reduced}
            whileDrag={reduced ? undefined : { scale: 1.06 }}
            style={{ x, y }}
          />
        }
        tabIndex={0}
        role="group"
        aria-roledescription="movable lens"
        aria-label="Lens. Drag it, or use the arrow keys to move it."
        onKeyDown={nudge}
        className="absolute top-1/2 left-1/2 -mt-16 -ml-16 size-32 cursor-grab touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus active:cursor-grabbing sm:-mt-20 sm:-ml-20 sm:size-40"
      />
    </div>
  );
}

const tiles = [
  ["Golden hour", "var(--sheen-chart-4)", "var(--sheen-chart-2)"],
  ["Deep sea", "var(--sheen-chart-7)", "var(--sheen-chart-1)"],
  ["Lagoon", "var(--sheen-chart-3)", "var(--sheen-chart-7)"],
  ["Bloom", "var(--sheen-chart-5)", "var(--sheen-chart-1)"],
  ["Ember", "var(--sheen-chart-8)", "var(--sheen-chart-4)"],
  ["Canopy", "var(--sheen-chart-6)", "var(--sheen-chart-3)"],
  ["Dusk", "var(--sheen-chart-1)", "var(--sheen-chart-5)"],
  ["Citrus", "var(--sheen-chart-2)", "var(--sheen-chart-4)"],
] as const;

const tabs = [
  { id: "library", label: "Library", icon: <LibraryIcon /> },
  { id: "for-you", label: "For you", icon: <SparkIcon /> },
  { id: "albums", label: "Albums", icon: <GridIcon /> },
  { id: "search", label: "Search", icon: <SearchIcon /> },
] as const;

function TabBarDemo() {
  const [active, setActive] = useState<string>("library");
  return (
    <div className="relative h-[26rem] w-full overflow-hidden rounded-[inherit]">
      {/* The content scrolls under the bar: watch the tiles bend at its rim. */}
      <div
        role="region"
        aria-label="Photo library (scrolls under the tab bar)"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so it can be scrolled without a mouse
        tabIndex={0}
        className="h-full overflow-y-auto overscroll-contain p-3 pb-28 [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus sm:p-4 sm:pb-28"
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...tiles, ...tiles].map(([name, a, b], i) => (
            <li
              key={i}
              className="flex aspect-[4/5] items-end rounded-sheen-md p-2.5"
              style={{ background: `linear-gradient(160deg, ${a}, ${b})` }}
            >
              <span className="rounded-sheen-full bg-sheen-surface/85 px-2.5 py-1 text-xs font-semibold text-sheen-fg">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <LiquidGlass
        shape="pill"
        render={<nav aria-label="Library sections" />}
        className="absolute inset-x-3 bottom-3 mx-auto flex max-w-md justify-between gap-1 p-1.5 sm:bottom-4"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={active === tab.id ? "page" : undefined}
            onClick={() => setActive(tab.id)}
            className="flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-sheen-full px-2 text-2xs font-semibold text-sheen-fg motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast) hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus aria-[current=page]:bg-sheen-surface/85 aria-[current=page]:[background-image:linear-gradient(var(--sheen-accent-soft),var(--sheen-accent-soft))] aria-[current=page]:text-sheen-accent any-pointer-coarse:min-h-14 forced-colors:aria-[current=page]:underline forced-colors:aria-[current=page]:outline-1 forced-colors:aria-[current=page]:outline-solid [&>svg]:size-5"
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </LiquidGlass>
    </div>
  );
}

/** The "Liquid glass" docs page (/effects/liquid-glass): live examples, props and notes. */
export function LiquidGlassPage() {
  const supported = useLiquidGlassSupport();
  return (
    <Page
      eyebrow="Effect"
      title="Liquid glass"
      description="A lens that bends the page behind it, like Apple's Liquid Glass: real refraction through an SVG displacement map, with a specular rim. Chromium bends the light; Safari and Firefox get SheenUI's frosted glass, and reduced transparency turns it solid."
      source={["theme/src/components/liquid-glass/liquid-glass.tsx", "theme/src/components/liquid-glass/lens-map.ts"]}
    >
      <ShowcaseStage<LiquidGlassSceneData>
        label="Liquid glass demo"
        story={() => import("../layout/ShowcaseStage.liquid-glass")}
        initial={{ x: 0.1, lens: false }}
        minHeight="18rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,28rem)]!"
      >
        {(scene, ctx) => <LiquidGlassScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <p className="-mt-6 flex flex-wrap items-center gap-2 text-sm text-sheen-fg-muted">
        In this browser:
        {supported ? (
          <Badge tone="success" dot>
            Refraction on
          </Badge>
        ) : (
          <Badge tone="warning" dot>
            Frosted fallback
          </Badge>
        )}
      </p>

      <Example
        title="Drag the lens"
        description="A clear circle lens over crisp artwork. Drag it (or focus it and use the arrow keys) and watch the lines bend and split into color at the rim."
        stageClassName="p-0 sm:p-0"
        code={`
import { useRef, type KeyboardEvent } from "react";
import { LiquidGlass } from "@sheenui/theme";
import { motion, useMotionValue } from "motion/react";

const moves: Partial<Record<string, [number, number]>> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
// Written out here on purpose: the library's clamp is internal, and this example has to run on its own.
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function Example() {
  const areaRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Arrow keys move the lens (Shift for bigger steps), kept inside the artwork.
  function nudge(event: KeyboardEvent<HTMLDivElement>) {
    const move = moves[event.key];
    const area = areaRef.current;
    if (!move || !area) return;
    event.preventDefault();
    const lens = event.currentTarget;
    const step = event.shiftKey ? 64 : 16;
    x.set(clamp(x.get() + move[0] * step, -lens.offsetLeft, area.clientWidth - lens.offsetLeft - lens.offsetWidth));
    y.set(clamp(y.get() + move[1] * step, -lens.offsetTop, area.clientHeight - lens.offsetTop - lens.offsetHeight));
  }

  return (
    <div ref={areaRef} className="relative h-96 overflow-hidden rounded-sheen-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-400">
      <LiquidGlass
        shape="circle"
        variant="clear"
        aberration={0.6}
        render={
          <motion.div
            drag
            dragConstraints={areaRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.06 }}
            style={{ x, y }}
          />
        }
        tabIndex={0}
        role="group"
        aria-roledescription="movable lens"
        aria-label="Lens. Drag it, or use the arrow keys to move it."
        onKeyDown={nudge}
        className="absolute top-1/2 left-1/2 -mt-20 -ml-20 size-40 cursor-grab touch-none"
      />
    </div>
  );
}`}
      >
        <DraggableLens />
      </Example>

      <Example
        title="Floating tab bar"
        description="A pill of regular liquid glass over scrolling content, the way iOS 26 floats its tab bars. Its tint thins out towards the rim, so the tiles visibly bend at the edge while the labels keep a solid backplate."
        stageClassName="p-0 sm:p-0"
        code={`
import { useState } from "react";
import { LiquidGlass } from "@sheenui/theme";

const tabs = [
  { id: "all", label: "All", icon: null },
  { id: "albums", label: "Albums", icon: null },
  { id: "shared", label: "Shared", icon: null },
];

export function Example() {
  const [active, setActive] = useState("all");

  return (
    <div className="relative h-[26rem] overflow-hidden">
      <div role="region" aria-label="Photo library" tabIndex={0} className="h-full overflow-y-auto p-3 pb-28">
        {/* tiles */}
      </div>
      <LiquidGlass
        shape="pill"
        render={<nav aria-label="Library sections" />}
        className="absolute inset-x-3 bottom-3 mx-auto flex max-w-md justify-between gap-1 p-1.5"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={active === tab.id ? "page" : undefined}
            onClick={() => setActive(tab.id)}
            className="flex min-h-12 flex-1 flex-col items-center justify-center rounded-sheen-full text-2xs font-semibold aria-[current=page]:text-sheen-accent"
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </LiquidGlass>
    </div>
  );
}`}
      >
        <TabBarDemo />
      </Example>

      <Example
        title="Shapes and variants"
        description="Pill, circle and rounded rectangle, each with its own displacement map. Interactive glass grows a touch on hover and presses in on tap: only its scale ever animates."
        stageClassName="p-0 sm:p-0"
        code={`
import { LiquidGlass } from "@sheenui/theme";
import { Play as PlayIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <LiquidGlass shape="pill" interactive render={<button type="button" />} className="h-12 px-6 text-sm font-semibold">
        Get started
      </LiquidGlass>

      <LiquidGlass
        shape="circle"
        interactive
        render={<button type="button" aria-label="Play" />}
        className="grid size-14 place-items-center [&>svg]:size-6"
      >
        <PlayIcon />
      </LiquidGlass>

      <LiquidGlass className="flex w-full max-w-72 flex-col gap-1 p-5">
        <p className="font-semibold">Now playing</p>
        <p className="text-sm text-sheen-fg-muted">Glass Animals · Heat Waves</p>
      </LiquidGlass>
    </>
  );
}`}
      >
        <div className="relative flex min-h-80 w-full flex-wrap items-center justify-center gap-6 p-6 sm:p-10">
          <LensArtwork />
          <LiquidGlass
            shape="pill"
            interactive
            render={<button type="button" />}
            className="h-12 px-6 text-sm font-semibold"
          >
            Get started
          </LiquidGlass>
          <LiquidGlass
            shape="circle"
            interactive
            render={<button type="button" aria-label="Play" />}
            className="grid size-14 place-items-center [&>svg]:size-6"
          >
            <PlayIcon />
          </LiquidGlass>
          <LiquidGlass className="flex w-full max-w-72 flex-col gap-1 p-5">
            <p className="font-semibold">Now playing</p>
            <p className="text-sm text-sheen-fg-muted">Glass Animals · Heat Waves</p>
          </LiquidGlass>
        </div>
      </Example>

      <PropsTable
        of={PROPS.LiquidGlass}
        rows={[
          ["render", "ReactElement | function", "<div />", "Render as another element: a button, a nav, a motion.div…"],
        ]}
      />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Not focusable: LiquidGlass is decoration. Give it role, tabIndex and handlers when it is a control; interactive adds a solid focus ring.",
          ],
        ]}
      />
      <A11yNotes
        items={[
          "Pure decoration around your content: text on a regular lens keeps 4.5:1 contrast on any backdrop, and the rim is decorative.",
          "The lens is Chromium only: Safari and Firefox keep the frosted blur. Reduced transparency, more contrast and forced colors give a solid surface; forced colors drop the rim.",
          "A draggable lens needs a keyboard alternative: the example moves with the arrow keys (Shift for bigger steps).",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Spotlight card
 * ===================================================================== */

const features: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Instant previews",
    body: "Every branch gets its own URL, ready before the review starts.",
    icon: <BoltIcon />,
  },
  { title: "Edge caching", body: "Pages are served from the region closest to each visitor.", icon: <GlobeIcon /> },
  {
    title: "Zero-config TLS",
    body: "Certificates are issued and renewed for you, on every domain.",
    icon: <LockIcon />,
  },
  { title: "Rollbacks", body: "Go back to any earlier deploy in one click, with no rebuild.", icon: <RewindIcon /> },
  { title: "Live logs", body: "Stream function logs as they happen, filtered by route.", icon: <PulseIcon /> },
  { title: "Team roles", body: "Owners, members and viewers, with audit history for each.", icon: <UsersIcon /> },
];

/** The "Spotlight card" docs page (/effects/spotlight-card): live examples, props and notes. */
export function SpotlightCardPage() {
  return (
    <Page
      eyebrow="Effect"
      title="Spotlight card"
      description="A glass card lit by a soft glow that follows the pointer, with a rim that catches the light. The position goes straight into CSS variables, once per frame at most: no React state, no re-renders."
      source="theme/src/components/spotlight/spotlight.tsx"
    >
      <ShowcaseStage<SpotlightCardSceneData>
        label="Spotlight card demo"
        story={() => import("../layout/ShowcaseStage.spotlight-card")}
        initial={{ at: null }}
        minHeight="16rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,28rem)]!"
      >
        {(scene, ctx) => <SpotlightCardScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Feature grid"
        description="In a SpotlightGroup every card shares the pointer, so the rims of neighboring cards light up as you move between them. On touch screens the glow rests near the top of each card."
        code={`
import { SpotlightCard, SpotlightGroup } from "@sheenui/theme";

const features = [
  { title: "Fast", body: "Compositor-only animation.", icon: "⚡" },
  { title: "Accessible", body: "Keyboard and screen reader tested.", icon: "♿" },
  { title: "Themeable", body: "Tokens for every color.", icon: "🎨" },
];

export function Example() {
  return (
    <SpotlightGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <SpotlightCard key={feature.title} className="p-6">
          <span className="grid size-10 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent">
            {feature.icon}
          </span>
          <h3 className="mt-4 font-semibold">{feature.title}</h3>
          <p className="mt-1 text-sm text-pretty text-sheen-fg-muted">{feature.body}</p>
        </SpotlightCard>
      ))}
    </SpotlightGroup>
  );
}`}
      >
        <SpotlightGroup className="docs-flat grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <SpotlightCard key={feature.title} className="p-6">
              <span className="grid size-10 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent [&>svg]:size-5">
                {feature.icon}
              </span>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-pretty text-sheen-fg-muted">{feature.body}</p>
            </SpotlightCard>
          ))}
        </SpotlightGroup>
      </Example>

      <Example
        title="Custom colors, as a link"
        description="Any CSS color works for the glow and the rim. Keyboard focus inside the card lights it too."
        code={`
import { Badge, Button, SpotlightCard } from "@sheenui/theme";

export function Example() {
  return (
    <SpotlightCard
      tint
      color="color-mix(in oklab, var(--sheen-accent-2) 18%, transparent)"
      rimColor="var(--sheen-accent-2)"
      className="flex w-full max-w-sm flex-col gap-4 p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id="pro" className="text-lg font-semibold">Pro</h3>
        <Badge tone="accent">Most popular</Badge>
      </div>
      <p className="text-4xl font-semibold tracking-tight">
        $24<span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
      </p>
      <ul className="flex flex-col gap-2 text-sm text-sheen-fg-muted">
        <li>Unlimited projects</li>
        <li>Preview deployments</li>
        <li>Priority support</li>
      </ul>
      <Button render={<a href="#pricing" />} fullWidth>
        Choose Pro
      </Button>
    </SpotlightCard>
  );
}`}
      >
        <SpotlightCard
          tint
          color="color-mix(in oklab, var(--sheen-accent-2) 18%, transparent)"
          rimColor="var(--sheen-accent-2)"
          className="flex w-full max-w-sm flex-col gap-4 p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 id="pro" className="text-lg font-semibold">
              Pro
            </h3>
            <Badge tone="accent">Most popular</Badge>
          </div>
          <p className="text-4xl font-semibold tracking-tight">
            $24<span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
          </p>
          <ul className="flex flex-col gap-2 text-sm text-sheen-fg-muted">
            <li>Unlimited projects</li>
            <li>Preview deployments</li>
            <li>Priority support</li>
          </ul>
          {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a> */}
          <Button render={<a href="#pricing" />} fullWidth>
            Choose Pro
          </Button>
        </SpotlightCard>
      </Example>

      <PropsTable title="SpotlightCard props" of={PROPS.SpotlightCard} />
      <PropsTable
        title="SpotlightGroup props"
        rows={[
          [
            "...props",
            "div props",
            "",
            "A plain div that shares one pointer with every SpotlightCard inside it. Lay the cards out with className.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Not focusable: a plain card is not focusable. Keyboard focus inside the card lights it too, so interactive children are never in the dark.",
          ],
        ]}
      />
      <A11yNotes
        items={[
          "No role of its own; reading order is the DOM order. SpotlightGroup shares one pointer listener across the cards.",
          "The glow and rim are aria-hidden and hidden in forced colors. On touch screens the glow is static.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Border beam
 * ===================================================================== */

export function BorderBeamPage() {
  const [paused, setPaused] = useState(false);
  return (
    <Page
      eyebrow="Effect"
      title="Border beam"
      description="A comet of light running around a rounded border. Its keyframes follow the real outline, so it keeps one speed and one length all the way round, even on a wide bar. It rests off-screen and holds still with reduced motion."
      source="theme/src/components/border-beam/border-beam.tsx"
    >
      <ShowcaseStage<BorderBeamSceneData>
        label="Border beam demo"
        story={() => import("../layout/ShowcaseStage.border-beam")}
        initial={{ beam: "idle" }}
        minHeight="16rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,26rem)]!"
      >
        {(scene, ctx) => <BorderBeamScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="On a glass card"
        description="Drop it inside any positioned, rounded element: it takes the parent's radius and sits on its border. paused holds the beam exactly where it is."
        stageClassName="min-h-80"
        controls={<Switch label="Pause the beam" checked={paused} onCheckedChange={setPaused} />}
        code={`
import { useState } from "react";
import { BorderBeam, GlassCard, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause the beam" checked={paused} onCheckedChange={setPaused} />
      <GlassCard className="relative w-full max-w-sm p-6">
        <h3 id="deploying-to-production" className="font-semibold">Deploying to production</h3>
        <p className="text-sm text-sheen-fg-muted">Build 2f9c1a · 14 of 18 steps</p>
        <BorderBeam paused={paused} />
      </GlassCard>
    </>
  );
}`}
      >
        <GlassCard className="relative flex w-full max-w-sm flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 id="deploying-to-production" className="font-semibold">
                Deploying to production
              </h3>
              <p className="mt-1 text-sm text-sheen-fg-muted">Build 2f9c1a · 14 of 18 steps</p>
            </div>
            <Badge tone="accent" dot pulse>
              Live
            </Badge>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sheen-hover">
            <div className="sheen-fill h-full w-[78%] rounded-full [background-image:var(--sheen-accent-fill)]" />
          </div>
          <BorderBeam paused={paused} />
        </GlassCard>
      </Example>

      <Example
        title="Wide bars, two beams, any color"
        description="On a wide search bar the beam keeps its pace along the long sides. double runs two beams on opposite sides; colors take any CSS color (here the warning and danger tokens)."
        stageClassName="min-h-80 flex-col"
        code={`
import { BorderBeam, Button, GlassCard, Input } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <div className="relative w-full max-w-xl rounded-sheen-md">
        <Input aria-label="Ask anything" placeholder="Ask anything…" leading={<SearchIcon />} />
        <BorderBeam length={160} duration={6} />
      </div>

      <Button variant="glass" size="lg" className="rounded-sheen-full">
        Upgrade
        <BorderBeam double duration={5} />
      </Button>

      <GlassCard className="relative p-5">
        2 alerts need attention
        <BorderBeam reverse duration={7} colorFrom="var(--sheen-warning)" colorTo="var(--sheen-danger)" />
      </GlassCard>
    </>
  );
}`}
      >
        <div className="relative w-full max-w-xl rounded-sheen-md">
          <Input aria-label="Ask anything" placeholder="Ask anything…" leading={<SearchIcon />} />
          <BorderBeam length={160} duration={6} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Button lays its children out in its own row, so the beam frames the whole button. */}
          <Button variant="glass" size="lg" className="rounded-sheen-full">
            Upgrade
            <BorderBeam double duration={5} />
          </Button>
          <GlassCard className="relative flex items-center gap-3 p-5 text-sm">
            <span className="size-2 rounded-full bg-sheen-warning" aria-hidden />
            <span>
              <span className="font-semibold">2 alerts</span>{" "}
              <span className="text-sheen-fg-muted">need attention</span>
            </span>
            <BorderBeam reverse duration={7} colorFrom="var(--sheen-warning)" colorTo="var(--sheen-danger)" />
          </GlassCard>
        </div>
      </Example>

      <PropsTable of={PROPS.BorderBeam} />
      <KeyboardTable rows={[["Tab", "Not focusable: the beam is decoration."]]} />
      <A11yNotes
        items={[
          "Purely decorative: aria-hidden, no focus, no pointer events, and hidden in forced colors.",
          "It sits on a card you provide, so contrast is that of the card. Under reduced motion it is a still beam lit on the top-left corner.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Icons (decorative; their buttons carry the names)
 * ===================================================================== */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {children}
    </svg>
  );
}

function LibraryIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

function SparkIcon() {
  return (
    <Icon>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </Icon>
  );
}

function GridIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </Icon>
  );
}

function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8Z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <Icon>
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </Icon>
  );
}

function GlobeIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Icon>
  );
}

function LockIcon() {
  return (
    <Icon>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}

function RewindIcon() {
  return (
    <Icon>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </Icon>
  );
}

function PulseIcon() {
  return (
    <Icon>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </Icon>
  );
}

function UsersIcon() {
  return (
    <Icon>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
    </Icon>
  );
}
