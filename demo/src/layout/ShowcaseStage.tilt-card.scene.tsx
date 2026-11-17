import { useState } from "react";
import { Badge, TiltCard, TiltCardLayer } from "@sheenui/theme";

import { useVirtualPointer } from "./ShowcaseStage.pointer";
import type { StageContext } from "./ShowcaseStage";
import type { TiltCardScene } from "./ShowcaseStage.tilt-card";

/** The live TiltCard on its stage: the story's pointer circles over it; the card leans, the layers drift, the glare slides. */
export function TiltCardScene({ scene }: { scene: TiltCardScene; ctx: StageContext }) {
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  useVirtualPointer(scope, "[data-slot='tilt-card']", scene.at);
  return (
    <div ref={setScope} className="flex w-full justify-center">
      <TiltCard tint className="flex aspect-[1.586] w-full max-w-72 flex-col p-4 text-start">
        <TiltCardLayer depth={6} className="flex items-start justify-between gap-3">
          <span className="font-semibold text-sheen-fg">Sheen Pay</span>
          <Badge tone="accent">Pro</Badge>
        </TiltCardLayer>
        <TiltCardLayer depth={10} className="mt-3">
          <span
            aria-hidden
            className="block h-7 w-10 rounded-md border border-sheen-border opacity-80 [background:linear-gradient(135deg,var(--sheen-chart-4),var(--sheen-chart-2))]"
          />
        </TiltCardLayer>
        <TiltCardLayer depth={16} className="mt-auto flex flex-col gap-0.5">
          <p className="m-0 font-sheen-mono text-sm tracking-wider text-sheen-fg">
            <span className="sr-only">Card ending in 0815</span>
            <span aria-hidden>4921 ···· ···· 0815</span>
          </p>
          <p className="sheen-stage-sub">Ada Lovelace, 09/29</p>
        </TiltCardLayer>
      </TiltCard>
    </div>
  );
}
