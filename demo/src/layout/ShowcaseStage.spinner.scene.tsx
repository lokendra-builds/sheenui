import { Spinner } from "@sheenui/theme";

import type { SpinnerScene } from "./ShowcaseStage.spinner";

/** The live Spinner on its stage: busy, then gone once the work is done. */
export function SpinnerScene({ scene }: { scene: SpinnerScene }) {
  return (
    <div className="sheen-stage-col">
      <div className="flex size-12 items-center justify-center text-sheen-success-text">
        {scene.done ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" strokeOpacity="0.35" />
            <path d="m7.5 12.5 3 3 6-6.5" />
          </svg>
        ) : (
          <Spinner size="xl" tone="accent" labels={{ loading: "Syncing files" }} />
        )}
      </div>
      <p className="sheen-stage-title">{scene.done ? "Everything is synced" : "Syncing 24 files"}</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {scene.done ? "Nothing left to do." : "This takes as long as it takes."}
      </p>
    </div>
  );
}
