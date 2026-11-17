import type { ReactNode } from "react";

import { href } from "../router";

function A({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={href(to)} className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg">
      {children}
    </a>
  );
}

const c = "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";

/** The landing text for the glass design tokens: the three glass levels, what each one reads, and the fallbacks. */
export function GlassTailwindIntro() {
  return (
    <>
      <section aria-labelledby="glass-levels-tokens" className="flex max-w-3xl flex-col gap-3">
        <h2 id="glass-levels-tokens" className="text-xl font-semibold tracking-tight">
          Three glass levels, each a set of CSS variables
        </h2>
        <p className="text-base leading-relaxed text-pretty">
          Glassmorphism is a frosted-glass look: a translucent tint, a backdrop blur and a light rim over a colorful
          background. In SheenUI it is not a pile of utility classes you repeat on every element. The stylesheet defines
          three utilities, <code className={c}>glass-1</code>, <code className={c}>glass-2</code> and{" "}
          <code className={c}>glass-3</code>, and every component picks one. Add a class to your own element and it gets
          the same surface: <code className={c}>{'<div className="glass-2 rounded-sheen-lg p-6">'}</code>.
        </p>
        <p className="text-base leading-relaxed text-pretty">
          Each level reads a few CSS variables: a tint (<code className={c}>--sheen-glass-2-bg</code>), a blur (
          <code className={c}>--sheen-glass-2-blur</code>), a saturation boost, a border and highlights for the lit rim.
          Because they are variables, the two style presets (Liquid Glass and Aurora Neon) and the light and dark themes
          only re-point them; no component changes. To use these utilities in a project, follow the{" "}
          <A to="/docs/tailwind-v4">Tailwind v4 glass UI setup</A> (the two imports), and see{" "}
          <A to="/components/glass-card">the glassmorphism card</A> for the basic surface.
        </p>
      </section>
      <section aria-labelledby="backdrop-filter-blur" className="flex max-w-3xl flex-col gap-3">
        <h2 id="backdrop-filter-blur" className="text-xl font-semibold tracking-tight">
          Backdrop-filter blur values and the glass budget
        </h2>
        <p className="text-base leading-relaxed text-pretty">
          The blur is <code className={c}>backdrop-filter</code>. Level 1 (chips, inputs, switches) has no blur of its
          own, only a tint and a rim, because a small control sitting on a blurred card would only blur that card's
          tint. Level 2 (cards, popovers) blurs 20px, and level 3 (dialogs, navigation bars) blurs 32px and is the most
          opaque. Every blurred surface costs a full offscreen pass per frame, so the site keeps at most 8 in view and a
          Lite mode cuts the blur on weak devices.{" "}
          <A to="/guides/backdrop-filter-performance">Backdrop-filter performance</A> measures why.
        </p>
        <div className="fv" aria-hidden>
          {[
            ["glass-1", "0", "6%"],
            ["glass-2", "20px", "55%"],
            ["glass-3", "32px", "100%"],
          ].map(([name, blur, fill]) => (
            <div key={name} className="fv-tile">
              <span className="font-sheen-mono">{name}</span>
              <strong>{blur === "0" ? "no blur" : blur}</strong>
              <span className="fv-bar" style={{ width: fill }} />
            </div>
          ))}
          <div className="fv-tile">
            <span className="font-sheen-mono">budget</span>
            <strong>8 in view</strong>
            <span>at most 3 refraction surfaces</span>
          </div>
        </div>
      </section>
      <section aria-labelledby="frosted-glass-css" className="flex max-w-3xl flex-col gap-3">
        <h2 id="frosted-glass-css" className="text-xl font-semibold tracking-tight">
          Frosted glass CSS without Tailwind
        </h2>
        <p className="text-base leading-relaxed text-pretty">
          The same look is plain CSS: a semi-transparent <code className={c}>background</code>,{" "}
          <code className={c}>backdrop-filter: blur(20px) saturate(180%)</code> and a 1px light border. The{" "}
          <A to="/guides/glassmorphism-react-tutorial">glassmorphism React tutorial</A> builds it layer by layer in CSS
          first, then in Tailwind, then as a component. What the utilities add is the part tutorials skip: dark-mode
          tuning, a specular highlight and the fallbacks below.
        </p>
        <pre className="fv-snippet" aria-hidden>
          <code>
            <b>background</b>: var(--sheen-glass-2-bg);{"\n"}
            <b>backdrop-filter</b>: blur(20px) saturate(180%);{"\n"}
            <b>border</b>: 1px solid var(--sheen-glass-border);
          </code>
        </pre>
      </section>
      <section aria-labelledby="solid-fallbacks" className="flex max-w-3xl flex-col gap-3">
        <h2 id="solid-fallbacks" className="text-xl font-semibold tracking-tight">
          Fallbacks: reduced transparency, more contrast, forced colors
        </h2>
        <p className="text-base leading-relaxed text-pretty">
          Glass is decoration, never the only thing keeping text readable. When the system asks for reduced transparency
          (or the in-app switch is on) or for more contrast, every level becomes a solid surface with a solid border. In
          Windows forced-colors mode it uses system colors with no blur and no rim, and the in-app Lite mode swaps the
          blur for a cheaper one. <A to="/guides/accessible-glassmorphism">Accessible glassmorphism</A> covers the
          contrast checks.
        </p>
        <div className="fv" aria-hidden>
          <div className="fv-tile glass-2">
            <span className="font-sheen-mono">default</span>
            <strong>Glass</strong>
            <span>tint, blur, lit rim</span>
          </div>
          <div className="fv-tile fv-solid">
            <span className="font-sheen-mono">reduced transparency / more contrast</span>
            <strong>Solid</strong>
            <span>solid fill, solid border</span>
          </div>
        </div>
      </section>
    </>
  );
}
