import { useRef, useState } from "react";
import { AnimatedBeam, GlassCard, Particles, SegmentedControl, Switch } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import { lazyBlock } from "../layout/lazy-block";
import type { AnimatedBeamScene as AnimatedBeamSceneData } from "../layout/ShowcaseStage.animated-beam";
import type { ParticlesScene as ParticlesSceneData } from "../layout/ShowcaseStage.particles";
import * as PROPS from "../generated/component-props";

const AnimatedBeamScene = lazyBlock(
  () => import("../layout/ShowcaseStage.animated-beam.scene").then((m) => m.AnimatedBeamScene),
  { minHeight: "19rem", eager: true },
);
const ParticlesScene = lazyBlock(
  () => import("../layout/ShowcaseStage.particles.scene").then((m) => m.ParticlesScene),
  { minHeight: "19rem", eager: true },
);

/* =====================================================================
 * Animated beam
 * ===================================================================== */

function Node({ ref, label }: { ref: React.Ref<HTMLDivElement>; label: string }) {
  return (
    <GlassCard ref={ref} className="grid size-16 place-items-center text-sm font-semibold">
      {label}
    </GlassCard>
  );
}

/** The "Animated beam" docs page (/effects/animated-beam): live examples, props and notes. */
export function AnimatedBeamPage() {
  const [paused, setPaused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const plain = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);

  return (
    <Page
      eyebrow="Effect"
      title="Animated beam"
      description="A light that travels along a path between two elements, measured from refs, for integration diagrams and data-flow maps. It leaves from the edge of each element, bends with curvature, moves by transform only, rests off-screen and in hidden tabs, and holds still when reduced motion is on."
      source="theme/src/components/animated-beam/animated-beam.tsx"
    >
      <ShowcaseStage<AnimatedBeamSceneData>
        label="Animated beam demo"
        story={() => import("../layout/ShowcaseStage.animated-beam")}
        initial={{ run: "idle" }}
        minHeight="19rem"
      >
        {(scene, ctx) => <AnimatedBeamScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Integration diagram"
        description="Three sources feed one hub. Each beam is staggered with delay and bent with curvature, so the network reads as alive without any one beam competing. The beam is decorative (aria-hidden), so say what is connected in the labels."
        controls={<Switch label="Pause beams" checked={paused} onCheckedChange={setPaused} />}
        stageClassName="min-h-80 px-4"
        code={`
import { useRef, useState } from "react";
import { AnimatedBeam, GlassCard, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);

  return (
    <>
      <Switch label="Pause beams" checked={paused} onCheckedChange={setPaused} />
      <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
        <div className="flex flex-col gap-8">
          <GlassCard ref={a} className="grid size-16 place-items-center text-sm font-semibold">Billing</GlassCard>
          <GlassCard ref={b} className="grid size-16 place-items-center text-sm font-semibold">Chat</GlassCard>
          <GlassCard ref={c} className="grid size-16 place-items-center text-sm font-semibold">Docs</GlassCard>
        </div>
        <GlassCard ref={hub} tint className="grid size-24 place-items-center font-semibold">Your app</GlassCard>
        <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={-40} paused={paused} />
        <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} delay={0.8} paused={paused} />
        <AnimatedBeam containerRef={container} fromRef={c} toRef={hub} curvature={40} delay={1.6} paused={paused} />
      </div>
    </>
  );
}`}
      >
        <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
          <div className="flex flex-col gap-8">
            <Node ref={a} label="Billing" />
            <Node ref={b} label="Chat" />
            <Node ref={c} label="Docs" />
          </div>
          <GlassCard ref={hub} tint className="grid size-24 place-items-center font-semibold">
            Your app
          </GlassCard>
          <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={-40} paused={paused} />
          <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} delay={0.8} paused={paused} />
          <AnimatedBeam containerRef={container} fromRef={c} toRef={hub} curvature={40} delay={1.6} paused={paused} />
        </div>
      </Example>

      <Example
        title="One connection, your colours"
        description="colorFrom and colorTo take any CSS colour (the defaults are the accent tokens), length and thickness shape the comet, and reverse sends it the other way, for a reply travelling back."
        stageClassName="min-h-48 px-4"
        code={`
import { useRef } from "react";
import { AnimatedBeam, GlassCard } from "@sheenui/theme";

export function Example() {
  const container = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);

  return (
    <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
      <GlassCard ref={from} className="grid size-16 place-items-center text-sm font-semibold">API</GlassCard>
      <GlassCard ref={to} className="grid size-16 place-items-center text-sm font-semibold">Client</GlassCard>
      <AnimatedBeam
        containerRef={container}
        fromRef={from}
        toRef={to}
        reverse
        length={96}
        thickness={3}
        colorFrom="var(--sheen-accent-2)"
        colorTo="var(--sheen-accent)"
      />
    </div>
  );
}`}
      >
        <div ref={plain} className="relative flex w-full max-w-md items-center justify-between py-6">
          <Node ref={from} label="API" />
          <Node ref={to} label="Client" />
          <AnimatedBeam
            containerRef={plain}
            fromRef={from}
            toRef={to}
            reverse
            length={96}
            thickness={3}
            colorFrom="var(--sheen-accent-2)"
            colorTo="var(--sheen-accent)"
          />
        </div>
      </Example>

      <PropsTable of={PROPS.AnimatedBeam} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Not focusable: the beam never takes focus or pointer events, so the elements it connects stay usable.",
          ],
        ]}
      />
      <A11yNotes
        items={[
          "Decorative: the overlay is aria-hidden. The connection must also be in text (a label, a heading or a sentence), because the picture is invisible to assistive technology.",
          "paused holds the light where it is, so a page can offer a stop control (WCAG 2.2.2). It also rests off-screen and in hidden tabs.",
          "Under reduced motion there is no light, only the faint still track between the elements.",
          "The light is one element moved by transform and faded by opacity along positions sampled from the real path; nothing blurs, masks or filters the glass nodes.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Particles
 * ===================================================================== */

/** The "Particles" docs page (/effects/particles): live examples, props and notes. */
export function ParticlesPage() {
  const [paused, setPaused] = useState(false);
  const [pointer, setPointer] = useState<"repel" | "attract" | "none">("repel");

  return (
    <Page
      eyebrow="Effect"
      title="Particles"
      description="A canvas field of small lights drifting slowly, leaning softly away from the pointer. The count follows the area and is always capped, halved on weak devices, drawn on the shared ambient beat, paused off-screen and in hidden tabs, and a single still frame under reduced motion."
      source={["theme/src/components/particles/particles.tsx", "theme/src/lib/canvas-effects.ts"]}
    >
      <ShowcaseStage<ParticlesSceneData>
        label="Particles demo"
        story={() => import("../layout/ShowcaseStage.particles")}
        initial={{ run: "idle" }}
        minHeight="19rem"
      >
        {(scene, ctx) => <ParticlesScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Behind glass"
        description="The particles are what the glass blurs, which makes the frosted card read as real. Move the mouse over it: nearby particles ease away (or towards the pointer), then settle back. Touch screens and reduced motion never react to the pointer."
        controls={
          <div className="flex flex-wrap items-center gap-4">
            <SegmentedControl
              aria-label="Pointer reaction"
              value={pointer}
              onValueChange={(value) => setPointer(value as "repel" | "attract" | "none")}
              items={[
                { value: "repel", label: "Repel" },
                { value: "attract", label: "Attract" },
                { value: "none", label: "None" },
              ]}
            />
            <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
          </div>
        }
        stageClassName="min-h-80 p-0 sm:p-0"
        code={`
import { useState } from "react";
import { GlassCard, Particles, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <div className="relative grid min-h-80 w-full place-items-center overflow-hidden rounded-sheen-xl">
        <Particles density={1.4} pointer="repel" paused={paused} />
        <GlassCard className="relative max-w-xs p-6 text-center">
          <h2 className="text-lg font-semibold">Build something calm</h2>
          <p className="mt-1 text-sm text-sheen-fg-muted">A soft field of light behind frosted glass.</p>
        </GlassCard>
      </div>
    </>
  );
}`}
      >
        <div className="relative grid min-h-80 w-full place-items-center overflow-hidden rounded-sheen-xl">
          <Particles density={1.4} pointer={pointer} paused={paused} />
          <GlassCard className="relative max-w-xs p-6 text-center">
            <h2 className="text-lg font-semibold">Build something calm</h2>
            <p className="mt-1 text-sm text-sheen-fg-muted">A soft field of light behind frosted glass.</p>
          </GlassCard>
        </div>
      </Example>

      <Example
        title="Dense and capped"
        description="density is particles per 10,000 px². Raise it as far as you like: maxCount is the hard ceiling (120 by default, 400 at most), and devices with little memory, few cores or Save-Data draw half."
        stageClassName="min-h-56 p-0 sm:p-0"
        code={`
import { Particles } from "@sheenui/theme";

export function Example() {
  return (
    <div className="relative min-h-56 w-full overflow-hidden rounded-sheen-xl">
      <Particles density={6} maxCount={90} radius={1.2} speed={6} pointer="none" />
    </div>
  );
}`}
      >
        <div className="relative min-h-56 w-full overflow-hidden rounded-sheen-xl">
          <Particles density={6} maxCount={90} radius={1.2} speed={6} pointer="none" />
        </div>
      </Example>

      <PropsTable of={PROPS.Particles} />
      <KeyboardTable rows={[["Tab", "Not focusable: the canvas is click-through and never takes focus."]]} />
      <A11yNotes
        items={[
          "Decorative: the layer is aria-hidden and carries no information. Particles are small and low in contrast so text above stays readable.",
          "Offer paused as a control where the field sits behind long reading (WCAG 2.2.2). It also rests off-screen and in hidden tabs.",
          "Reduced motion draws one still frame, with no loop and no pointer reaction. Colours are the accent tokens read from the page, redrawn when the theme or style preset changes.",
          "Cost: one canvas on the shared ambient beat (about 30 Hz, fewer while scrolling), device pixel ratio capped at 2, count capped and halved on weak devices.",
        ]}
      />
    </Page>
  );
}
