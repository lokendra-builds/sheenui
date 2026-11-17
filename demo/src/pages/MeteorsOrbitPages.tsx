import { useState } from "react";
import { Badge, GlassCard, Meteors, OrbitingCircles, Switch } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import { lazyBlock } from "../layout/lazy-block";
import type { MeteorsScene as MeteorsSceneData } from "../layout/ShowcaseStage.meteors";
import type { OrbitingCirclesScene as OrbitingCirclesSceneData } from "../layout/ShowcaseStage.orbiting-circles";
import * as PROPS from "../generated/component-props";

const MeteorsScene = lazyBlock(() => import("../layout/ShowcaseStage.meteors.scene").then((m) => m.MeteorsScene), {
  minHeight: "17rem",
  eager: true,
});
const OrbitingCirclesScene = lazyBlock(
  () => import("../layout/ShowcaseStage.orbiting-circles.scene").then((m) => m.OrbitingCirclesScene),
  { minHeight: "23rem", eager: true },
);

/* =====================================================================
 * Meteors
 * ===================================================================== */

/** The "Meteors" docs page (/effects/meteors): live examples, props and notes. */
export function MeteorsPage() {
  const [paused, setPaused] = useState(false);

  return (
    <Page
      eyebrow="Effect"
      title="Meteors"
      description="Occasional streaks of light crossing a card or section background. Each meteor flies, then rests for a few seconds, so the card is mostly still. Streaks move by transform and opacity only, pause off-screen and in hidden tabs, and hold a few faint still lines when reduced motion is on."
      source={["theme/src/components/meteors/meteors.tsx", "theme/src/lib/canvas-effects.ts"]}
    >
      <ShowcaseStage<MeteorsSceneData>
        label="Meteors demo"
        story={() => import("../layout/ShowcaseStage.meteors")}
        initial={{ run: "idle" }}
        minHeight="17rem"
      >
        {(scene, ctx) => <MeteorsScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="On a glass card"
        description="Meteors fills its relative parent, takes the parent's corner radius and clips to it. Put it before the content so the text sits above the streaks, and keep count low: a long interval is what keeps it occasional."
        controls={<Switch label="Pause" checked={paused} onCheckedChange={setPaused} />}
        stageClassName="min-h-72"
        code={`
import { useState } from "react";
import { Badge, GlassCard, Meteors, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <GlassCard className="relative w-full max-w-sm overflow-hidden p-8">
        <Meteors count={8} paused={paused} />
        <Badge className="relative">Launch week</Badge>
        <h2 className="relative mt-3 text-xl font-semibold">Ship the quiet details</h2>
        <p className="relative mt-1 text-sm text-sheen-fg-muted">A streak crosses now and then, never twice at once.</p>
      </GlassCard>
    </>
  );
}`}
      >
        <GlassCard className="relative w-full max-w-sm overflow-hidden p-8">
          <Meteors count={8} paused={paused} />
          <Badge className="relative">Launch week</Badge>
          <h2 className="relative mt-3 text-xl font-semibold">Ship the quiet details</h2>
          <p className="relative mt-1 text-sm text-sheen-fg-muted">
            A streak crosses now and then, never twice at once.
          </p>
        </GlassCard>
      </Example>

      <Example
        title="Angle, length and rhythm"
        description="angle is the direction of travel in degrees clockwise from pointing right (90 is straight down). A shorter interval and more meteors make a shower; keep that for a one-off hero."
        stageClassName="min-h-56"
        code={`
import { GlassCard, Meteors } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="relative w-full max-w-sm overflow-hidden p-8">
      <Meteors count={14} angle={70} length={150} duration={1.2} interval={2.5} />
      <p className="relative text-sm">A faster shower at 70 degrees.</p>
    </GlassCard>
  );
}`}
      >
        <GlassCard className="relative w-full max-w-sm overflow-hidden p-8">
          <Meteors count={14} angle={70} length={150} duration={1.2} interval={2.5} />
          <p className="relative text-sm">A faster shower at 70 degrees.</p>
        </GlassCard>
      </Example>

      <PropsTable of={PROPS.Meteors} />
      <KeyboardTable rows={[["Tab", "Not focusable: the layer is click-through and never takes focus."]]} />
      <A11yNotes
        items={[
          "Decorative: the layer is aria-hidden. Streaks are thin and fade quickly; use paused where a card sits next to long text (WCAG 2.2.2).",
          "Reduced motion: nothing flies. Up to four faint still streaks stay as texture.",
          "Each streak is one element moved by transform and faded by opacity on the compositor, with no blur, mask or filter. They pause off-screen and in hidden tabs.",
          "The layout is seeded (seed), so the server and the browser render the same streaks and there is no hydration mismatch or layout shift.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Orbiting circles
 * ===================================================================== */

const GLYPHS = ["A", "B", "C", "D", "E", "F"];

function Glyph({ children }: { children: string }) {
  return <span className="glass-2 grid size-10 place-items-center rounded-full text-sm font-semibold">{children}</span>;
}

/** The "Orbiting circles" docs page (/effects/orbiting-circles): live examples, props and notes. */
export function OrbitingCirclesPage() {
  const [paused, setPaused] = useState(false);

  return (
    <Page
      eyebrow="Effect"
      title="Orbiting circles"
      description="Items circling a centre on rings, for integration and works-with sections. Each item stays upright while the ring turns, by transform only. It holds still while an item is hovered or focused, pauses off-screen and in hidden tabs, and rests on the ring when reduced motion is on."
      source="theme/src/components/orbiting-circles/orbiting-circles.tsx"
    >
      <ShowcaseStage<OrbitingCirclesSceneData>
        label="Orbiting circles demo"
        story={() => import("../layout/ShowcaseStage.orbiting-circles")}
        initial={{ run: "idle" }}
        minHeight="23rem"
      >
        {(scene, ctx) => <OrbitingCirclesScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Two rings"
        description="Stack rings with different radius, duration, reverse and startAngle around a central card. Give the ring a label when the items mean something: it then becomes a labelled list. Glass items use level-2 glass; keep a handful in view."
        controls={<Switch label="Pause" checked={paused} onCheckedChange={setPaused} />}
        stageClassName="min-h-[26rem]"
        code={`
import { useState } from "react";
import { GlassCard, OrbitingCircles, Switch } from "@sheenui/theme";

const GLYPHS = ["A", "B", "C", "D", "E", "F"];

function Glyph({ children }: { children: string }) {
  return <span className="glass-2 grid size-10 place-items-center rounded-full text-sm font-semibold">{children}</span>;
}

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <div className="relative grid size-[22rem] place-items-center">
        <GlassCard tint className="relative grid size-20 place-items-center text-sm font-semibold">Core</GlassCard>
        <OrbitingCircles label="Inner integrations" radius={96} duration={24} paused={paused}>
          {GLYPHS.slice(0, 3).map((g) => (
            <Glyph key={g}>{g}</Glyph>
          ))}
        </OrbitingCircles>
        <OrbitingCircles label="Outer integrations" radius={160} duration={36} reverse startAngle={30} paused={paused}>
          {GLYPHS.slice(3).map((g) => (
            <Glyph key={g}>{g}</Glyph>
          ))}
        </OrbitingCircles>
      </div>
    </>
  );
}`}
      >
        <div className="relative grid size-[22rem] max-w-full place-items-center">
          <GlassCard tint className="relative grid size-20 place-items-center text-sm font-semibold">
            Core
          </GlassCard>
          <OrbitingCircles label="Inner integrations" radius={96} duration={24} paused={paused}>
            {GLYPHS.slice(0, 3).map((g) => (
              <Glyph key={g}>{g}</Glyph>
            ))}
          </OrbitingCircles>
          <OrbitingCircles
            label="Outer integrations"
            radius={160}
            duration={36}
            reverse
            startAngle={30}
            paused={paused}
          >
            {GLYPHS.slice(3).map((g) => (
              <Glyph key={g}>{g}</Glyph>
            ))}
          </OrbitingCircles>
        </div>
      </Example>

      <PropsTable of={PROPS.OrbitingCircles} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Moves through any links or buttons inside the items, in their order. The ring itself is not focusable.",
          ],
          ["Focus on an item", "Holds the ring still (pauseOnHover) so nobody chases a moving control."],
        ]}
      />
      <A11yNotes
        items={[
          "Without label the ring is decorative and aria-hidden; never put interactive items in a hidden ring. With label it is a labelled list with one item per child, in order.",
          "pauseOnHover holds the ring while the pointer or focus is on an item; paused gives a page a stop control (WCAG 2.2.2). It also rests off-screen and in hidden tabs.",
          "Reduced motion: the items rest on the ring, still, in the same places.",
          "Two transform rotations per item on the compositor (the ring turns, the item turns back); nothing blurs, masks or filters the items.",
        ]}
      />
    </Page>
  );
}
