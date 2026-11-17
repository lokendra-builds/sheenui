import { useEffect, useRef } from "react";
import { TextReveal, useSheenReducedMotion } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { TextRevealScene as Scene } from "./ShowcaseStage.text-reveal";

/** The live TextReveal on its stage: the panel scrolls to the end and the statement lights up word by word. */
export function TextRevealScene({ scene }: { scene: Scene; ctx: StageContext }) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = useSheenReducedMotion();
  const end = scene.run !== "idle";
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // End where the statement's last line sits past the reveal's end (80 % of the panel), so every word is lit, but never
    // scrolled so far that the first line leaves the panel: its top keeps 1.5rem of padding.
    const heading = el.querySelector("h2");
    const top =
      end && heading
        ? Math.min(heading.offsetTop + heading.offsetHeight - el.clientHeight * 0.75, heading.offsetTop - 24)
        : 0;
    el.scrollTo({ top, behavior: end && !reduced && scene.run === "run" ? "smooth" : "auto" });
  }, [end, reduced, scene.run]);
  return (
    <div className="sheen-stage-col w-full">
      <div
        ref={scroller}
        role="group"
        aria-label="Manifesto (stage)"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a named scroll region must be keyboard-reachable (WCAG 2.1.1): without focus a keyboard user cannot scroll it
        tabIndex={0}
        className="relative h-56 w-full overflow-y-auto rounded-sheen-xl border border-sheen-border p-6 text-start focus-visible:outline-2 focus-visible:outline-sheen-focus"
      >
        <div className="h-24" />
        <TextReveal
          as="h2"
          container={scroller}
          offset={["start 0.9", "end 0.8"]}
          className="text-xl leading-tight sm:text-2xl font-semibold tracking-tight text-balance"
        >
          We build interfaces that feel like light passing through glass: calm, precise and never in the way.
        </TextReveal>
        <div className="h-48" />
      </div>
      <p className="sheen-stage-sub">{end ? "Every word is lit." : "Scroll to read."}</p>
    </div>
  );
}
