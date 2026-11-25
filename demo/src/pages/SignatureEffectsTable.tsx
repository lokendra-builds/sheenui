import { href } from "../router";

type Effect = {
  name: string;
  what: string;
  code: string;
  to: string;
  where: string;
};

/** Every signature effect of the library, the export that builds it and the page where it runs live. */
const EFFECTS: readonly Effect[] = [
  {
    name: "Hero entrance",
    what: "The home hero builds in one timeline: badge, headline, text, buttons and floating cards arrive in order.",
    code: "Hero (docs site) with spring and follow tokens",
    to: "/",
    where: "Home",
  },
  {
    name: "Scroll parallax and reveals",
    what: "Layers drift at different speeds as you scroll, rows rise in when a panel enters, and the hero hands off to the page.",
    code: "useScroll in the home sections, plus CSS scroll timelines in backdrop.css",
    to: "/",
    where: "Home",
  },
  {
    name: "Pointer-reactive light",
    what: "A soft light follows the cursor across glass, so the surface looks like it catches the light.",
    code: "SpotlightCard, useSheenPointerLight",
    to: "/effects/spotlight-card",
    where: "Spotlight card",
  },
  {
    name: "Magnetic and press physics",
    what: "A primary button leans toward the cursor as it gets close, then lifts on hover and sinks on press.",
    code: "Button, useMagnetic",
    to: "/components/button",
    where: "Button",
  },
  {
    name: "3D tilt",
    what: "A card turns a few degrees toward the pointer on a spring and settles flat when you leave.",
    code: "TiltCard, TiltCardLayer",
    to: "/effects/3d-tilt-card",
    where: "Tilt card",
  },
  {
    name: "Shared-element morph",
    what: "A card grows into its dialog and shrinks back, so the eye follows one object. A selection pill slides between options the same way.",
    code: "MorphingDialog, Segmented",
    to: "/effects/morphing-dialog",
    where: "Morphing dialog",
  },
  {
    name: "Rolling numbers",
    what: "Digits roll to a new value instead of swapping, and charts draw in when they appear.",
    code: "NumberTicker, chart components",
    to: "/effects/number-ticker",
    where: "Number ticker",
  },
  {
    name: "Drag physics",
    what: "Toasts can be swiped away and a drawer can be dragged shut, and the exit speed follows how fast you flick.",
    code: "Toaster, Drawer",
    to: "/components/toast",
    where: "Toast",
  },
  {
    name: "Route transitions",
    what: "Changing page cross-fades and lifts the new content, using the browser's view transitions when they exist.",
    code: "startRouteTransition",
    to: "/foundations",
    where: "Any page link",
  },
  {
    name: "Ambient backdrop",
    what: "Slow ribbons and orbs (Liquid) or an aurora sky (Aurora) move behind the glass and pause when off screen or under Pause motion.",
    code: "SheenBackdrop",
    to: "/",
    where: "Home",
  },
  {
    name: "Text effects",
    what: "Headlines blur in, type out, rotate words or shimmer.",
    code: "BlurIn, Typewriter, WordRotate, ShimmerText",
    to: "/effects/blur-in",
    where: "Blur in",
  },
  {
    name: "Micro-interactions",
    what: "Button glow, a light sweep across cards, an underline that draws, icon nudges and a focus pulse.",
    code: "Button, GlassCard, DialogContent",
    to: "/components/button",
    where: "Button",
  },
  {
    name: "Theme wave",
    what: "Switching light and dark sweeps a circle of the new theme out from the switch you pressed.",
    code: "useThemeWave (docs site)",
    to: "/",
    where: "Home, theme switch",
  },
  {
    name: "One light for a bento grid",
    what: "One pointer light is shared by every cell of a bento grid, so only one glow is ever painted.",
    code: "BentoGrid, BentoCell",
    to: "/blocks/bento-grid",
    where: "Bento grid",
  },
];

/** The "Every signature effect" table on /foundations: one row per effect, each linked to a live page. */
export function SignatureEffectsTable() {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="signature-effects">
      <h2 id="signature-effects" className="text-xl font-semibold tracking-tight">
        Every signature effect
      </h2>
      <p className="max-w-3xl text-sm text-sheen-fg-muted">
        These are the moments that make the library feel physical. Each row names the export behind it and links to a
        page where it runs live. Turn on Reduce motion in the bar at the top and every row stops moving.
      </p>
      <div className="overflow-x-auto rounded-sheen-lg border border-sheen-border">
        <table className="w-full min-w-[44rem] border-collapse text-start text-sm">
          <caption className="sr-only">Signature effects, their exports and where to see them live</caption>
          <thead className="text-xs text-sheen-fg-muted">
            <tr className="border-b border-sheen-border">
              <th scope="col" className="px-4 py-3 text-start font-medium">
                Effect
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                What it does
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                Export
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                See it live
              </th>
            </tr>
          </thead>
          <tbody>
            {EFFECTS.map((e) => (
              <tr key={e.name} className="border-b border-sheen-border align-top last:border-0">
                <th scope="row" className="px-4 py-3 text-start font-semibold">
                  {e.name}
                </th>
                <td className="px-4 py-3 text-sheen-fg-muted">{e.what}</td>
                <td className="px-4 py-3 font-sheen-mono text-xs text-sheen-accent">{e.code}</td>
                <td className="px-4 py-3">
                  <a
                    href={href(e.to)}
                    className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
                  >
                    {e.where}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
