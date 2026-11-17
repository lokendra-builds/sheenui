import { Typewriter } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { TypewriterScene } from "./ShowcaseStage.typewriter";

const PROMPTS = ["Draft a launch email for Friday", "Make it shorter and warmer"] as const;

/** The live Typewriter on its stage, typing into an assistant's prompt box. Each prompt is typed once. */
export function TypewriterScene({ scene }: { scene: TypewriterScene; ctx: StageContext }) {
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-sub">Ask your assistant</p>
      <div className="flex min-h-12 w-full items-center rounded-sheen-lg border border-sheen-border px-4 py-3 text-start text-sheen-fg">
        {scene.prompt === -1 ? (
          <span aria-hidden className="text-sheen-fg-muted">
            Type a request
          </span>
        ) : (
          <Typewriter key={scene.prompt} words={PROMPTS[scene.prompt]} loop={false} reserveSpace={false} />
        )}
      </div>
    </div>
  );
}
