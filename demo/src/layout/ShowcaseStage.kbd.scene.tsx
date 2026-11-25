import { Fragment } from "react";
import { Kbd, formatShortcut, useShortcutPlatform } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { KbdScene } from "./ShowcaseStage.kbd";

/** The live Kbd keys on their stage: the story presses each key cap of "mod+k" in turn (⌘ K on a Mac, Ctrl K elsewhere). */
export function KbdScene({ scene }: { scene: KbdScene; ctx: StageContext }) {
  const [held] = useFollow(scene.held);
  const [opened] = useFollow(scene.opened);
  const keys = formatShortcut("mod+k", useShortcutPlatform()).keys;
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Search anything</p>
      <div className="flex items-center gap-1.5" aria-label={`Shortcut: ${keys.join(" ")}`} role="group">
        {keys.map((key, i) => (
          <Fragment key={key}>
            {i > 0 ? (
              <span aria-hidden className="text-xs text-sheen-fg-muted">
                +
              </span>
            ) : null}
            <Kbd
              size="md"
              className={
                held > i
                  ? "translate-y-px scale-95 bg-sheen-accent-soft text-sheen-accent shadow-none transition-transform duration-(--sheen-duration-press)"
                  : "transition-transform duration-(--sheen-duration-press)"
              }
            >
              {key}
            </Kbd>
          </Fragment>
        ))}
      </div>
      <p className="sheen-stage-sub sheen-stage-slot">
        {opened ? <span className="sheen-stage-chip">Search opened</span> : "Press it from anywhere."}
      </p>
    </div>
  );
}
