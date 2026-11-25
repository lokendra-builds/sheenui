import { useEffect, useRef } from "react";
import { Button, Confetti, GlassCard, useConfetti } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { ConfettiScene as Scene } from "./ShowcaseStage.confetti";

/** The live Confetti on its stage: the order button is pressed, paper bursts from it and the order stays confirmed. */
export function ConfettiScene({ scene }: { scene: Scene; ctx: StageContext }) {
  const { ref, fire } = useConfetti();
  const button = useRef<HTMLButtonElement>(null);
  const placed = scene.run !== "idle";
  useEffect(() => {
    if (scene.run === "run") fire({ origin: button.current ?? undefined, count: 140, spread: 100 });
  }, [scene.run, fire]);
  return (
    <div className="sheen-stage-col w-full">
      <GlassCard className="w-full p-6 text-start">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="m-0 text-xl font-semibold tracking-tight">Studio plan</h2>
          <span className="text-xl font-semibold">$48</span>
        </div>
        <p className="sheen-stage-sub mt-1">Annual, three seats, billed today.</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="sheen-stage-sub m-0">{placed ? "Order placed." : "Ready to order."}</p>
          <Button ref={button} onClick={(event) => fire({ origin: event.currentTarget, count: 140, spread: 100 })}>
            {placed ? "Order again" : "Place order"}
          </Button>
        </div>
      </GlassCard>
      <Confetti ref={ref} badge="Order placed" />
    </div>
  );
}
