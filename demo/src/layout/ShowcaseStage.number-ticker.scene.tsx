import { NumberTicker } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { NumberTickerScene } from "./ShowcaseStage.number-ticker";

/** The live NumberTickers on their stage: every digit is a wheel that rolls to the new value. */
export function NumberTickerScene({ scene }: { scene: NumberTickerScene; ctx: StageContext }) {
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-sub">Monthly revenue</p>
      <p className="m-0 text-4xl font-semibold tracking-tight text-sheen-fg tabular-nums">
        <NumberTicker
          value={scene.revenue}
          from={12480}
          animateOnView={false}
          duration={0.9}
          live="off"
          format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        />
      </p>
      <p className="sheen-stage-sub">
        <NumberTicker
          value={scene.users}
          from={402118}
          animateOnView={false}
          duration={0.9}
          live="off"
          suffix=" users"
        />
      </p>
    </div>
  );
}
