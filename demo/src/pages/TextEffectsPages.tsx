import { useState } from "react";
import { Avatar, Button, GlassCard, Switch, useToast } from "@sheenui/theme";
import { BlurIn } from "@sheenui/theme";
import { WordRotate } from "@sheenui/theme";
import { Typewriter } from "@sheenui/theme";
import { ShimmerText } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { DEMO_LOCALE } from "../demo-clock";
import * as PROPS from "../generated/component-props";
import { Icon } from "./TextEffectsPages/shared";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { BlurInScene as BlurInSceneData } from "../layout/ShowcaseStage.blur-in";
import { BlurInScene } from "../layout/ShowcaseStage.blur-in.scene";
import type { WordRotateScene as WordRotateSceneData } from "../layout/ShowcaseStage.word-rotate";
import { WordRotateScene } from "../layout/ShowcaseStage.word-rotate.scene";
import type { TypewriterScene as TypewriterSceneData } from "../layout/ShowcaseStage.typewriter";
import { TypewriterScene } from "../layout/ShowcaseStage.typewriter.scene";
import type { ShimmerTextScene as ShimmerTextSceneData } from "../layout/ShowcaseStage.shimmer-text";
import { ShimmerTextScene } from "../layout/ShowcaseStage.shimmer-text.scene";

/** A small "Replay" control: remounting the effect (new key) plays it again. */
function useReplay() {
  const [key, setKey] = useState(0);
  const control = (
    <Button variant="glass" size="sm" onClick={() => setKey((k) => k + 1)} leading={<ReplayIcon />}>
      Replay
    </Button>
  );
  return [key, control] as const;
}

/* =====================================================================
 * Blur in
 * ===================================================================== */

export function BlurInPage() {
  const [heroKey, heroReplay] = useReplay();
  const [charKey, charReplay] = useReplay();
  return (
    <Page
      eyebrow="Effect"
      title="Blur in"
      description="Words sharpen out of a soft blur one after another, rising a little as they land: the hero-headline reveal. Screen readers get the sentence once, in one piece; reduced motion shows plain text straight away."
      source={["theme/src/components/text-effects/blur-in.tsx", "theme/src/components/text-effects/text-utils.ts"]}
    >
      <ShowcaseStage<BlurInSceneData>
        label="Blur in demo"
        story={() => import("../layout/ShowcaseStage.blur-in")}
        initial={{ headline: false, sub: false }}
        minHeight="16rem"
      >
        {(scene, ctx) => <BlurInScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Hero headline"
        description="Render it as any element with render (here paragraphs styled as a headline; use render={<h1 />} for the page's real heading). It plays once, when it scrolls into view."
        controls={heroReplay}
        stageClassName="min-h-72"
        code={`
import { BlurIn } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
      <BlurIn
        render={<p />}
        text="Interfaces you can see through."
        className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl"
      />
      <BlurIn
        render={<p />}
        text="Glass components with motion that stays readable, accessible and fast."
        delay={0.45}
        stagger={0.03}
        blur={6}
        className="max-w-lg text-base text-pretty text-sheen-fg-muted sm:text-lg"
      />
    </div>
  );
}`}
      >
        <div key={heroKey} className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <BlurIn
            render={<p />}
            text="Interfaces you can see through."
            className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl"
          />
          <BlurIn
            render={<p />}
            text="Glass components with motion that stays readable, accessible and fast."
            delay={0.45}
            stagger={0.03}
            blur={6}
            className="max-w-lg text-base text-pretty text-sheen-fg-muted sm:text-lg"
          />
        </div>
      </Example>

      <Example
        title="Character by character"
        description={
          'by="character" reveals each letter (emoji and accents stay whole). Words never break apart mid-line. It is also the mode for languages written without spaces.'
        }
        controls={charReplay}
        code={`
import { BlurIn } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BlurIn
        by="character"
        render={<p />}
        text="Ship it ✨"
        blur={12}
        offset="0.5em"
        className="text-5xl font-bold tracking-tight sm:text-6xl"
      />
      <BlurIn
        by="character"
        render={<p />}
        text="こんにちは、世界"
        delay={0.5}
        stagger={0.05}
        lang="ja"
        className="text-xl font-medium text-sheen-fg-muted"
      />
    </div>
  );
}`}
      >
        <div key={charKey} className="flex flex-col items-center gap-3 text-center">
          <BlurIn
            by="character"
            render={<p />}
            text="Ship it ✨"
            blur={12}
            offset="0.5em"
            className="text-5xl font-bold tracking-tight sm:text-6xl"
          />
          <BlurIn
            by="character"
            render={<p />}
            text="こんにちは、世界"
            delay={0.5}
            stagger={0.05}
            className="text-xl font-medium text-sheen-fg-muted"
            lang="ja"
          />
        </div>
      </Example>

      <PropsTable
        of={PROPS.BlurIn}
        rows={[["render", "ReactElement | function", "<span />", "Render as another element: an h1, a p…"]]}
      />
      <KeyboardTable rows={[["Tab", "Not focusable: this is text."]]} />
      <A11yNotes
        items={[
          "The text is in the DOM from the start, so screen readers and search engines read it once, whether or not it has animated.",
          "Under reduced motion it is plain static text, with nothing to wait for.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Word rotate
 * ===================================================================== */

export function WordRotatePage() {
  const [paused, setPaused] = useState(false);
  return (
    <Page
      eyebrow="Effect"
      title="Word rotate"
      description="One slot in a sentence that cycles through words, each sliding up through a clipped window. The slot is as wide as the longest word, so the sentence never reflows, and an optional highlight morphs to fit each word. It pauses off screen, in hidden tabs and under the pointer; screen readers hear every word once, as a list."
      source={["theme/src/components/text-effects/word-rotate.tsx", "theme/src/components/text-effects/text-utils.ts"]}
    >
      <ShowcaseStage<WordRotateSceneData>
        label="Word rotate demo"
        story={() => import("../layout/ShowcaseStage.word-rotate")}
        initial={{ index: 0 }}
        minHeight="15rem"
      >
        {(scene, ctx) => <WordRotateScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="In a headline"
        description="highlightClassName draws a pill behind the current word: watch it morph between short and long words (transforms only, corners stay round). Padding goes in wordClassName so the pill and the word line up. Rest the pointer on it, or use the switch, to pause."
        controls={<Switch label="Pause" checked={paused} onCheckedChange={setPaused} />}
        stageClassName="min-h-64"
        code={`
import { useState } from "react";
import { Switch, WordRotate } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <p className="text-center text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        Built for{" "}
        <WordRotate
          words={["designers", "developers", "founders", "everyone"]}
          paused={paused}
          className="text-sheen-accent"
          wordClassName="px-3"
          highlightClassName="rounded-sheen-md bg-sheen-accent-soft"
        />
      </p>
    </>
  );
}`}
      >
        <p className="text-center text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          Built for{" "}
          <WordRotate
            words={["designers", "developers", "founders", "everyone"]}
            locales={DEMO_LOCALE}
            paused={paused}
            className="text-sheen-accent"
            wordClassName="px-3"
            highlightClassName="rounded-sheen-md bg-sheen-accent-soft"
          />
        </p>
      </Example>

      <Example
        title="Inside running text"
        description={
          'direction="down" brings words in from above; align="center" centers shorter words in the slot. A custom label gives screen readers a better sentence than the plain list.'
        }
        code={`
import { WordRotate } from "@sheenui/theme";

export function Example() {
  return (
    <p className="max-w-md text-center text-xl text-pretty sm:text-2xl">
      Your dashboard,{" "}
      <WordRotate
        words={["faster", "clearer", "calmer"]}
        direction="down"
        align="center"
        interval={2}
        label="faster, clearer and calmer"
        className="font-semibold text-sheen-accent"
      />{" "}
      than ever.
    </p>
  );
}`}
      >
        <p className="max-w-md text-center text-xl text-pretty sm:text-2xl">
          Your dashboard,{" "}
          <WordRotate
            words={["faster", "clearer", "calmer"]}
            direction="down"
            align="center"
            interval={2}
            label="faster, clearer and calmer"
            className="font-semibold text-sheen-accent"
          />{" "}
          than ever.
        </p>
      </Example>

      <PropsTable of={PROPS.WordRotate} />
      <KeyboardTable rows={[["Tab", "Not focusable: this is text."]]} />
      <A11yNotes
        items={[
          "Screen readers get the words once, as plain text (override it with label); the rotating word is not re-announced every few seconds.",
          "Under reduced motion it stays on the current word.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Typewriter
 * ===================================================================== */

const commands = ["pnpm add @sheenui/theme", "pnpm dev --open", "git push origin main"];

/** The "Typewriter" docs page (/effects/typewriter): live examples, props and notes. */
export function TypewriterPage() {
  const toast = useToast();
  const [answerKey, answerReplay] = useReplay();
  return (
    <Page
      eyebrow="Effect"
      title="Typewriter"
      description="Types a phrase with a human rhythm, holds it, deletes it and types the next. The caret is solid while typing and blinks while it waits. The space of the longest phrase is reserved up front, so nothing around it moves."
      source={["theme/src/components/text-effects/typewriter.tsx", "theme/src/components/text-effects/text-utils.ts"]}
    >
      <ShowcaseStage<TypewriterSceneData>
        label="Typewriter demo"
        story={() => import("../layout/ShowcaseStage.typewriter")}
        initial={{ prompt: -1 }}
        minHeight="17rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,26rem)]!"
      >
        {(scene, ctx) => <TypewriterScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Rotating phrases"
        description="Several phrases loop. It pauses while off screen, in a hidden tab, or under the pointer; paused, the caret holds still."
        stageClassName="min-h-56"
        code={`
import { Typewriter } from "@sheenui/theme";

export function Example() {
  return (
    <p className="text-center text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
      I build{" "}
      <Typewriter
        words={["design systems.", "fast websites.", "accessible apps."]}
        className="text-sheen-accent"
      />
    </p>
  );
}`}
      >
        <p className="text-center text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          I build{" "}
          <Typewriter words={["design systems.", "fast websites.", "accessible apps."]} className="text-sheen-accent" />
        </p>
      </Example>

      <Example
        title="Terminal"
        description="Monospace, a block-ish caret, quicker keys. The reserved space keeps the card from jumping; in a flex row next to the prompt, a long command wraps inside its own column on narrow screens."
        code={`
import { GlassCard, Typewriter } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard level={3} sheen={false} className="w-full max-w-md overflow-hidden">
      {/* Window controls (decorative) */}
      <div aria-hidden className="flex items-center gap-1.5 border-b border-sheen-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-sheen-danger" />
        <span className="size-2.5 rounded-full bg-sheen-warning" />
        <span className="size-2.5 rounded-full bg-sheen-success" />
      </div>
      <p className="flex gap-[1ch] p-5 font-sheen-mono text-sm">
        <span aria-hidden className="text-sheen-fg-subtle">$</span>
        <Typewriter
          words={["pnpm add @sheenui/theme", "pnpm dev --open", "git push origin main"]}
          typeSpeed={0.04}
          hold={1.4}
          cursorClassName="w-[0.6em] rounded-none bg-sheen-fg-muted"
          className="min-w-0"
        />
      </p>
    </GlassCard>
  );
}`}
      >
        <GlassCard level={3} sheen={false} className="w-full max-w-md overflow-hidden">
          <div aria-hidden className="flex items-center gap-1.5 border-b border-sheen-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-sheen-danger" />
            <span className="size-2.5 rounded-full bg-sheen-warning" />
            <span className="size-2.5 rounded-full bg-sheen-success" />
          </div>
          <p className="flex gap-[1ch] p-5 font-sheen-mono text-sm">
            <span aria-hidden className="text-sheen-fg-subtle">
              $
            </span>
            <Typewriter
              words={commands}
              typeSpeed={0.04}
              hold={1.4}
              cursorClassName="w-[0.6em] rounded-none bg-sheen-fg-muted"
              className="min-w-0"
            />
          </p>
        </GlassCard>
      </Example>

      <Example
        title="Type once"
        description="A single phrase types once (loop is off by default for one phrase); the caret blinks a few times, then fades. onComplete fires at the end. The paragraph is already full height before the first letter."
        controls={answerReplay}
        code={`
import { Avatar, GlassCard, Typewriter, useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <GlassCard className="flex w-full max-w-md gap-3 p-5">
      <Avatar name="Sheen Assistant" size="sm" />
      <p className="text-sm text-pretty">
        <Typewriter
          words="Your workspace is ready. We imported 24 components, set up dark mode and turned on reduced-motion support."
          typeSpeed={0.025}
          onComplete={() => toast.success("Setup complete")}
        />
      </p>
    </GlassCard>
  );
}`}
      >
        <GlassCard className="flex w-full max-w-md gap-3 p-5">
          <Avatar name="Sheen Assistant" size="sm" />
          <p key={answerKey} className="text-sm text-pretty">
            <Typewriter
              words="Your workspace is ready. We imported 24 components, set up dark mode and turned on reduced-motion support."
              typeSpeed={0.025}
              onComplete={() => toast.success("Setup complete")}
            />
          </p>
        </GlassCard>
      </Example>

      <PropsTable of={PROPS.Typewriter} />
      <KeyboardTable rows={[["Tab", "Not focusable: this is text."]]} />
      <A11yNotes
        items={[
          "Screen readers get every phrase once, as plain text (override it with label); the typing itself is aria-hidden.",
          "That copy is unselectable, so copying gets only what is on screen. It waits until it is on screen and pauses in a hidden tab or while the pointer rests on it: a pointer convenience, not a WCAG 2.2.2 mechanism, since keyboard and touch users cannot hover. A loop that runs longer than 5 s needs a visible pause button wired to paused. Under reduced motion it shows the first phrase, complete, with no caret.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Shimmer text
 * ===================================================================== */

export function ShimmerTextPage() {
  const [viewKey, viewReplay] = useReplay();
  return (
    <Page
      eyebrow="Effect"
      title="Shimmer text"
      description="A band of light sweeps across the letters: once when the text appears, on hover, or on a loop for status lines. The real text is never split or hidden; the light is a masked copy that moves with transforms only."
      source="theme/src/components/text-effects/shimmer-text.tsx"
    >
      <ShowcaseStage<ShimmerTextSceneData>
        label="Shimmer text demo"
        story={() => import("../layout/ShowcaseStage.shimmer-text")}
        initial={{ done: false }}
        minHeight="15rem"
      >
        {(scene, ctx) => <ShimmerTextScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Status line"
        description={
          'trigger="loop" for work in progress. It only runs while on screen, and stops with reduced motion.'
        }
        code={`
import { Avatar, GlassCard, ShimmerText } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="flex w-full max-w-md flex-col gap-4 p-5">
      <p className="ms-auto max-w-[85%] rounded-sheen-lg rounded-ee-sheen-sm bg-sheen-accent-soft px-4 py-2.5 text-sm">
        Which plan fits a team of twelve?
      </p>
      <div className="flex items-center gap-3">
        <Avatar name="Sheen Assistant" size="sm" />
        <ShimmerText trigger="loop" className="text-sm font-medium text-sheen-fg-muted">
          Thinking through your question…
        </ShimmerText>
      </div>
    </GlassCard>
  );
}`}
      >
        <GlassCard className="flex w-full max-w-md flex-col gap-4 p-5">
          <p className="ms-auto max-w-[85%] rounded-sheen-lg rounded-ee-sheen-sm bg-sheen-accent-soft px-4 py-2.5 text-sm">
            Which plan fits a team of twelve?
          </p>
          <div className="flex items-center gap-3">
            <Avatar name="Sheen Assistant" size="sm" />
            <ShimmerText trigger="loop" className="text-sm font-medium text-sheen-fg-muted">
              Thinking through your question…
            </ShimmerText>
          </div>
        </GlassCard>
      </Example>

      <Example
        title="On view and on hover"
        description="The headline sweeps once as it scrolls in. In a link or button, hover (or keyboard focus) anywhere on the control replays it."
        controls={viewReplay}
        code={`
import { Button, ShimmerText } from "@sheenui/theme";
import { ArrowRight as ArrowIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <ShimmerText className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Meet the new glass
      </ShimmerText>

      {/* ArrowIcon: any 16px svg icon */}
      <Button variant="glass" render={<a href="#changelog" />} trailing={<ArrowIcon />}>
        <ShimmerText trigger="hover" duration={1.1}>See what's new</ShimmerText>
      </Button>
    </>
  );
}`}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <ShimmerText key={viewKey} className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Meet the new glass
          </ShimmerText>
          {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a> */}
          <Button variant="glass" render={<a href="#changelog" />} trailing={<ArrowIcon />}>
            <ShimmerText trigger="hover" duration={1.1}>
              See what's new
            </ShimmerText>
          </Button>
        </div>
      </Example>

      <PropsTable of={PROPS.ShimmerText} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            'Not focusable: this is text. With "hover", keyboard focus reaching the control around it triggers the sweep too.',
          ],
        ]}
      />
      <A11yNotes
        items={[
          "The highlight copy is aria-hidden, so the text is read once. The default highlight is the accent, which keeps AA contrast.",
          "Under reduced motion there is no overlay at all, just the text; in forced colors the overlay is hidden.",
        ]}
      />
    </Page>
  );
}

function ReplayIcon() {
  return (
    <Icon className="size-3.5">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </Icon>
  );
}

function ArrowIcon() {
  return (
    <Icon className="size-4 rtl:-scale-x-100">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}
