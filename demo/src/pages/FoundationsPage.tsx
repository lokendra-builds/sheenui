import { GlassCard, SheenLogo, SheenMark } from "@sheenui/theme";

import { CommandField } from "../layout/CommandField";
import { Faq } from "../layout/LazyAbout";
import { SITE_URL } from "../seo/site";
import { Page, PropsTable } from "../layout/Page";
import * as PROPS from "../generated/component-props";
import { Example, Stage } from "../layout/Example";
import { lazyBlock } from "../layout/lazy-block";
import { whenNear } from "./when-near";

/* Below the fold and demo-only: separate chunks, fetched once idle. The prerendered HTML already holds both at full size. */
const SceneSwitcherDemo = lazyBlock(() => import("./SceneSwitcherDemo").then((m) => m.SceneSwitcherDemo), {
  minHeight: "14rem",
});
// The last two islands are fetched when they are about to scroll into view (see when-near.ts), not at idle.
const SignatureEffectsTable = lazyBlock(
  () =>
    whenNear("foundations-effects")
      .then(() => import("./SignatureEffectsTable"))
      .then((m) => m.SignatureEffectsTable),
  { minHeight: "30rem" },
);

// The token board is static markup for the look that is on; as an island it costs no initial JS and keeps its server HTML.
const TokenBoard = lazyBlock(() => import("./FoundationsTokenBoard").then((m) => m.TokenBoard), {
  minHeight: "40rem",
});
const GlassTailwindIntro = lazyBlock(() => import("./FoundationsGlassIntro").then((m) => m.GlassTailwindIntro), {
  minHeight: "60rem",
});
const FoundationComponents = lazyBlock(
  () =>
    whenNear("foundations-components")
      .then(() => import("./FoundationsComponents"))
      .then((m) => m.FoundationComponents),
  { minHeight: "40rem" },
);
const ApiConventions = lazyBlock(() => import("./FoundationsApiConventions").then((m) => m.ApiConventions), {
  minHeight: "60rem",
});
const MotionDemo = lazyBlock(() => import("./FoundationsMotionDemo").then((m) => m.MotionDemo), {
  minHeight: "17rem",
});

const levels = [
  [1, "glass-1", "Chips, inputs, toggles. Light blur, most transparent."],
  [2, "glass-2", "Cards and popovers. The everyday surface."],
  [3, "glass-3", "Dialogs and nav bars. Strongest blur, most opaque, safest for text."],
] as const;

/** The "Foundations" docs page (/foundations): live examples, props and notes. */
export function FoundationsPage() {
  return (
    <Page
      eyebrow="Foundations"
      title="Tokens, glass & motion"
      description="Everything in SheenUI is built from a small set of CSS variables and motion tokens. Change them once and every component follows."
      source={["theme/src/styles", "theme/src/motion"]}
    >
      <TokenBoard />
      <section className="flex flex-col gap-4">
        <h2 id="glass-levels" className="text-xl font-semibold tracking-tight">
          Glass levels: backdrop-filter blur for three surfaces
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          Three levels, each with a solid fallback. Try <strong>Reduce transparency</strong> or{" "}
          <strong>Lite glass</strong> in the top bar.
        </p>
        <Stage className="min-h-72 items-stretch">
          {levels.map(([level, cls, body]) => (
            // A hard-edged striped bar and a bright disc sit behind the top of each card (the card
            // keeps an empty band over them), so the blur and tint steps between levels are visible.
            <div key={cls} className="relative isolate w-full max-w-56">
              <div aria-hidden className="absolute inset-x-3 top-3 h-16 overflow-hidden rounded-sheen-lg">
                <div className="absolute inset-0 [background-image:repeating-linear-gradient(90deg,var(--sheen-accent)_0_12px,transparent_12px_24px)]" />
                <div className="absolute inset-y-0 start-[52%] aspect-square rounded-full [background-image:var(--sheen-accent-fill)] shadow-[0_0_0_3px_var(--sheen-focus)]" />
              </div>
              <GlassCard level={level} className="relative flex h-full w-full flex-col gap-2 p-5">
                <div aria-hidden className="h-16" />
                <code className="font-sheen-mono text-sm font-semibold text-sheen-accent">.{cls}</code>
                <p className="text-sm text-sheen-fg-muted">{body}</p>
              </GlassCard>
            </div>
          ))}
        </Stage>
      </section>
      <GlassTailwindIntro />

      <ApiConventions />

      <section className="flex flex-col gap-4">
        <h2 id="scenes" className="text-xl font-semibold tracking-tight">
          Scenes: a real picture behind the glass
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          <code className="font-sheen-mono">SheenScene</code> is an image layer for the first child of a positioned
          container, so the blur has something to refract. The <code className="font-sheen-mono">dim</code> prop
          (default 0.5) mixes the page background over it to keep text readable. Serve the files from your own public
          folder; this page adds the site base path to the same URLs.
        </p>
        <p className="text-sm text-sheen-fg-muted">
          The scene example below uses three components. Add them with the shadcn CLI, or copy the files the Files to
          copy lists on each component page:
        </p>
        <CommandField
          command={`npx shadcn@latest add ${SITE_URL}/r/backdrop.json ${SITE_URL}/r/glass-card.json ${SITE_URL}/r/segmented.json`}
          label="Install command: the components the scene example uses"
        />
        <Example
          title="Scene switcher"
          stageClassName="items-stretch"
          code={`
import { useState } from "react";
import { GlassCard, SegmentedControl, SheenScene } from "@sheenui/theme";

const scenes = ["room", "swoosh", "street", "hills", "studio"];

export function Example() {
  const [scene, setScene] = useState("room");

  return (
    <div>
      <SegmentedControl
        aria-label="Scene"
        value={scene}
        onValueChange={setScene}
        items={scenes.map((name) => ({ value: name, label: name }))}
      />
      <div style={{ position: "relative", isolation: "isolate", overflow: "hidden", borderRadius: 16 }}>
        <SheenScene
          key={scene}
          src={\`/scenes/\${scene}-v2.webp\`}
          avifSrc={\`/scenes/\${scene}-v2.avif\`}
          srcSet={\`/scenes/\${scene}-800-v2.webp 800w, /scenes/\${scene}-v2.webp 1600w\`}
          avifSrcSet={\`/scenes/\${scene}-800-v2.avif 800w, /scenes/\${scene}-v2.avif 1600w\`}
          dim={0.5}
        />
        <div style={{ position: "relative", display: "grid", gap: 12, padding: 16, minHeight: 256, alignContent: "center" }}>
          {[1, 2, 3].map((level) => (
            <GlassCard key={level} level={level as 1 | 2 | 3} className="p-4">
              glass-{level}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}`}
        >
          <SceneSwitcherDemo />
        </Example>
        <PropsTable of={PROPS.SheenScene} title="SheenScene props" as="h3" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="motion" className="text-xl font-semibold tracking-tight">
          Motion tokens
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          Springs are defined by duration and bounce. Press play to compare them. With reduced motion on, they all
          become instant.
        </p>
        <MotionDemo />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="logo-and-mark" className="text-xl font-semibold tracking-tight">
          Logo and mark
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          A folded satin ribbon “S”: light on the upper bowl and the band, a deep violet fold below, the moment light
          catches a polished surface. Use <code className="font-sheen-mono">{"<SheenLogo />"}</code> for the full logo,{" "}
          <code className="font-sheen-mono">{"<SheenMark />"}</code> for the ribbon alone, and{" "}
          <code className="font-sheen-mono">sheen-glint.svg</code> (or the files in{" "}
          <code className="font-sheen-mono">brand/</code>) for favicons and images.
        </p>
        <Stage className="min-h-48 gap-10">
          <SheenLogo px={48} />
          <SheenMark px={72} />
          <div className="flex items-end gap-3">
            <SheenMark px={40} />
            <SheenMark px={28} />
            <SheenMark px={20} />
            <SheenMark px={16} />
          </div>
        </Stage>
      </section>

      <div id="foundations-effects">
        <SignatureEffectsTable />
      </div>

      <div id="foundations-components">
        <FoundationComponents />
      </div>
      <Faq
        items={[
          {
            q: "How do I put a glass surface on my own element?",
            a: "Give the element glass-1, glass-2 or glass-3. Each utility sets a translucent tint, a backdrop blur and a lit border from variables, so you do not repeat the CSS on each element. The setup (the Tailwind imports) is on the Tailwind v4 glass UI page.",
          },
          {
            q: "Which backdrop-filter blur should I use?",
            a: "SheenUI blurs 20px on cards and popovers and 32px on dialogs and navigation bars, and none on small controls. Larger blurs cost more per frame, so keep a handful of blurred surfaces in view.",
          },
          {
            q: "Can I change the glass tint or blur?",
            a: "Yes. Override the variables, for example --sheen-glass-2-bg or --sheen-glass-2-blur, on :root or on one container. Components follow because they read the variables, and the two style presets do exactly that.",
          },
          {
            q: "What happens when someone turns off transparency?",
            a: "The glass becomes a solid surface with a solid border for reduced transparency and more contrast, and system colors in Windows forced-colors mode. Text contrast does not depend on the blur.",
          },
        ]}
      />
    </Page>
  );
}
