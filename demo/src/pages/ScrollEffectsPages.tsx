import { useRef, useState } from "react";
import { Button, Confetti, GlassCard, ScrollProgress, Switch, TextReveal, useConfetti } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import { lazyBlock } from "../layout/lazy-block";
import type { TextRevealScene as TextRevealSceneData } from "../layout/ShowcaseStage.text-reveal";
import type { ScrollProgressScene as ScrollProgressSceneData } from "../layout/ShowcaseStage.scroll-progress";
import type { ConfettiScene as ConfettiSceneData } from "../layout/ShowcaseStage.confetti";
import * as PROPS from "../generated/component-props";

const TextRevealScene = lazyBlock(
  () => import("../layout/ShowcaseStage.text-reveal.scene").then((m) => m.TextRevealScene),
  { minHeight: "19rem", eager: true },
);
const ScrollProgressScene = lazyBlock(
  () => import("../layout/ShowcaseStage.scroll-progress.scene").then((m) => m.ScrollProgressScene),
  { minHeight: "19rem", eager: true },
);
const ConfettiScene = lazyBlock(() => import("../layout/ShowcaseStage.confetti.scene").then((m) => m.ConfettiScene), {
  minHeight: "14rem",
  eager: true,
});

/* =====================================================================
 * Text reveal
 * ===================================================================== */

const MANIFESTO =
  "We build interfaces that feel like light passing through glass: calm, precise and never in the way of the thing you came to do.";

/** The "Text reveal" docs page (/effects/text-reveal): live examples, props and notes. */
export function TextRevealPage() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <Page
      eyebrow="Effect"
      title="Text reveal"
      description="A statement whose words light up one after another as you scroll. It is real text, readable without JavaScript, and only opacity changes, so nothing shifts. Scroll-linked, so it needs no loop, and every word is fully visible when reduced motion is on."
      source="theme/src/components/text-reveal/text-reveal.tsx"
    >
      <ShowcaseStage<TextRevealSceneData>
        label="Text reveal demo"
        story={() => import("../layout/ShowcaseStage.text-reveal")}
        initial={{ run: "idle" }}
        minHeight="19rem"
      >
        {(scene, ctx) => <TextRevealScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Scroll inside the panel"
        description="Pass container to follow a scrollable panel instead of the page. offset sets where the reveal starts and ends; here it begins as the text enters the panel and finishes at the middle. Scroll back and the words dim again."
        stageClassName="min-h-96 p-0 sm:p-0"
        code={`
import { useRef } from "react";
import { TextReveal } from "@sheenui/theme";

export function Example() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div ref={scroller} role="region" aria-label="Manifesto" tabIndex={0} className="h-96 w-full overflow-y-auto p-8 focus-visible:outline-2 focus-visible:outline-sheen-focus">
      <div className="h-40" />
      <TextReveal
        as="h2"
        container={scroller}
        offset={["start 0.9", "end 0.5"]}
        className="text-3xl font-semibold tracking-tight text-balance"
      >
        We build interfaces that feel like light passing through glass: calm, precise and never in the way of the thing you came to do.
      </TextReveal>
      <div className="h-96" />
    </div>
  );
}`}
      >
        <div
          ref={scroller}
          role="region"
          aria-label="Manifesto"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a named scroll region must be keyboard-reachable (WCAG 2.1.1): without focus a keyboard user cannot scroll it
          tabIndex={0}
          className="h-96 w-full overflow-y-auto p-8 focus-visible:outline-2 focus-visible:outline-sheen-focus"
        >
          <div className="h-40" />
          <TextReveal
            as="h2"
            container={scroller}
            offset={["start 0.9", "end 0.5"]}
            className="text-3xl font-semibold tracking-tight text-balance"
          >
            {MANIFESTO}
          </TextReveal>
          <div className="h-96" />
        </div>
      </Example>

      <Example
        title="On the page, as a paragraph"
        description="Without container it follows the page scroll. Raise dim towards 1 for a subtler reveal; keep it at 0.25 or above so unread words stay legible."
        stageClassName="min-h-48"
        code={`
import { TextReveal } from "@sheenui/theme";

export function Example() {
  return (
    <TextReveal dim={0.4} className="max-w-xl text-lg text-pretty">
      Each word arrives as you reach it, left to right, like a progress bar made of language.
    </TextReveal>
  );
}`}
      >
        <TextReveal dim={0.4} className="max-w-xl text-lg text-pretty">
          Each word arrives as you reach it, left to right, like a progress bar made of language.
        </TextReveal>
      </Example>

      <PropsTable of={PROPS.TextReveal} />
      <KeyboardTable rows={[["Tab", "Not focusable: the text is plain content in the normal reading order."]]} />
      <A11yNotes
        items={[
          "The words are real text with normal spaces, in order: selectable, searchable and read by screen readers whatever their opacity. Before hydration (or without JavaScript) every word is fully visible.",
          "Dimmed words are lower contrast until revealed: keep dim at 0.25 or above, and avoid the effect on text that must be read at once (instructions, legal copy).",
          'Use as="h2" only for a heading that belongs in the outline.',
          "Only opacity changes, driven by the scroll position through MotionValues: no layout shift, no React renders while scrolling, no loop to pause. Reduced motion shows every word at full opacity.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Scroll progress
 * ===================================================================== */

/** The "Scroll progress" docs page (/effects/scroll-progress): live examples, props and notes. */
export function ScrollProgressPage() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <Page
      eyebrow="Effect"
      title="Scroll progress"
      description="A thin bar that fills with the page or a panel's scroll, through a scaleX transform. Decorative by default; it becomes a named progressbar only when you give it a label because the position matters. It follows the reading direction and keeps tracking under reduced motion, without the easing."
      source="theme/src/components/scroll-progress/scroll-progress.tsx"
    >
      <ShowcaseStage<ScrollProgressSceneData>
        label="Scroll progress demo"
        story={() => import("../layout/ShowcaseStage.scroll-progress")}
        initial={{ run: "idle" }}
        minHeight="19rem"
      >
        {(scene, ctx) => <ScrollProgressScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Following a panel"
        description='container follows a scrollable element and placement="inline" keeps the bar in the flow, here above the content inside a glass card. With label the bar is exposed as a progressbar that updates in 5 % steps.'
        stageClassName="min-h-96 p-0 sm:p-0"
        code={`
import { useRef } from "react";
import { GlassCard, ScrollProgress } from "@sheenui/theme";

export function Example() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <GlassCard className="w-full max-w-md overflow-hidden">
      <ScrollProgress placement="inline" container={scroller} label="Reading progress" />
      <div ref={scroller} className="h-72 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold">A long read</h2>
        <p className="mt-2 h-[48rem] text-sm text-sheen-fg-muted">Scroll this panel and watch the bar fill.</p>
      </div>
    </GlassCard>
  );
}`}
      >
        <GlassCard className="w-full max-w-md overflow-hidden">
          <ScrollProgress placement="inline" container={scroller} label="Reading progress" />
          <div ref={scroller} className="h-72 overflow-y-auto p-6">
            <h2 className="text-lg font-semibold">A long read</h2>
            <p className="mt-2 h-[48rem] text-sm text-sheen-fg-muted">Scroll this panel and watch the bar fill.</p>
          </div>
        </GlassCard>
      </Example>

      <Example
        title="Fixed to the page"
        description="The default placement is the top edge of the viewport and follows the page scroll. This site shows it as a thin strip while you read; colours default to the accent tokens and can be overridden with colorFrom and colorTo."
        stageClassName="min-h-24"
        code={`
import { ScrollProgress } from "@sheenui/theme";

export function Example() {
  return <ScrollProgress thickness={4} />;
}`}
      >
        <p className="text-sm text-sheen-fg-muted">
          On a real page, <code>{"<ScrollProgress />"}</code> sits fixed along the top edge. It is not mounted here so
          it does not cover this site&apos;s own header.
        </p>
      </Example>

      <PropsTable of={PROPS.ScrollProgress} />
      <KeyboardTable rows={[["Tab", "Not focusable and never takes pointer events."]]} />
      <A11yNotes
        items={[
          "Decision: decorative by default and aria-hidden, because browsers already show and announce scroll position and a role that changes on every scroll would be noise.",
          "Pass label only where the position carries meaning (a course, a long form): the bar becomes a progressbar with that name and a value that updates in 5 % steps, never on every pixel.",
          "Reduced motion: the bar still tracks the scroll exactly (a direct mapping, not an animation) but without the spring. In forced colors it uses the system highlight colour.",
          "The fill is a scaleX transform driven by the scroll position: no layout, no paint, no loop, so there is nothing to pause. It grows from the inline start in right-to-left pages.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Confetti
 * ===================================================================== */

/** The "Confetti" docs page (/effects/confetti): live examples, props and notes. */
export function ConfettiPage() {
  const { ref, fire } = useConfetti();
  const [count, setCount] = useState(0);
  const [big, setBig] = useState(false);

  return (
    <Page
      eyebrow="Effect"
      title="Confetti"
      description="A one-shot burst of paper for success moments, fired from an event handler with useConfetti. It costs nothing while idle, caps the piece count (halved on weak devices), ends in a hidden tab, and under reduced motion shows an optional still badge in a polite live region instead of a burst."
      source={["theme/src/components/confetti/confetti.tsx", "theme/src/lib/canvas-effects.ts"]}
    >
      <ShowcaseStage<ConfettiSceneData>
        label="Confetti demo"
        story={() => import("../layout/ShowcaseStage.confetti")}
        initial={{ run: "idle" }}
        minHeight="14rem"
      >
        {(scene, ctx) => <ConfettiScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Fire from a button"
        description="origin takes an element (the burst starts at its centre) or a point of the viewport. Never let confetti be the only sign of success: the text below changes too. With reduced motion the badge appears at the top of the screen instead."
        controls={<Switch label="Bigger burst" checked={big} onCheckedChange={setBig} />}
        stageClassName="min-h-48 flex-col gap-3"
        code={`
import { useState } from "react";
import { Button, Confetti, useConfetti } from "@sheenui/theme";

export function Example() {
  const { ref, fire } = useConfetti();
  const [done, setDone] = useState(0);

  return (
    <>
      <Button
        onClick={(event) => {
          setDone((n) => n + 1);
          fire({ origin: event.currentTarget, count: 140, spread: 100 });
        }}
      >
        Place order
      </Button>
      <p className="text-sm text-sheen-fg-muted">{done === 0 ? "Nothing placed yet." : "Orders placed: " + done}</p>
      <Confetti ref={ref} badge="Order placed" />
    </>
  );
}`}
      >
        <Button
          onClick={(event) => {
            setCount((n) => n + 1);
            fire({
              origin: event.currentTarget,
              count: big ? 140 : 80,
              spread: big ? 100 : 75,
            });
          }}
        >
          Place order
        </Button>
        <p className="text-sm text-sheen-fg-muted">{count === 0 ? "Nothing placed yet." : `Orders placed: ${count}`}</p>
        <Confetti ref={ref} badge="Order placed" />
      </Example>

      <PropsTable of={PROPS.Confetti} />
      <KeyboardTable
        rows={[
          ["Tab", "Not focusable: the canvas never takes pointer events, so the page stays usable during a burst."],
        ]}
      />
      <A11yNotes
        items={[
          "The canvas is decorative and aria-hidden. Always show text or a toast too; confetti is never the only sign of success.",
          "Reduced motion: fire() draws nothing. With the badge prop, a still message appears for badgeDuration seconds in a polite live region (role=status), so the moment is marked and announced.",
          "Nothing runs while idle. The loop exists only while pieces are in flight, then the canvas hides itself; a hidden tab ends the burst. Count is capped at 220 and halved on devices with little memory, few cores or Save-Data.",
          "The canvas lives in a portal on body, never inside a glass surface, so it cannot flatten any glass.",
        ]}
      />
    </Page>
  );
}
