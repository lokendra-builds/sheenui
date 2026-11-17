import { Marquee } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { MarqueeScene } from "./ShowcaseStage.marquee";

const BRANDS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka"] as const;

/** The live Marquee on its stage: a strip of logos that glides while the story runs; the Pause button works. */
export function MarqueeScene({ scene }: { scene: MarqueeScene; ctx: StageContext }) {
  const [running, setRunning] = useFollow(scene.running);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-sub">Trusted by teams at</p>
      <Marquee
        className="w-full"
        speed={55}
        gap={16}
        paused={!running}
        onPausedChange={(paused) => setRunning(!paused)}
        listLabel="Customers"
      >
        {BRANDS.map((name) => (
          <span
            key={name}
            className="rounded-full border border-sheen-border px-4 py-1.5 text-sm font-semibold text-sheen-fg"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
