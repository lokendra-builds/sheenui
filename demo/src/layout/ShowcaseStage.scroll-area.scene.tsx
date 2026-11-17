import { useEffect, useRef } from "react";
import { ScrollArea, useSheenReducedMotion } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { ScrollAreaScene } from "./ShowcaseStage.scroll-area";

const NOTES = [
  ["Glass refraction on cards", "v1.4"],
  ["Faster tab indicator", "v1.4"],
  ["Right-to-left carousel", "v1.3"],
  ["Toast stack on mobile", "v1.3"],
  ["Slider keyboard steps", "v1.2"],
  ["New Aurora preset", "v1.2"],
  ["Calendar range mode", "v1.1"],
  ["Accessible charts", "v1.1"],
  ["First public release", "v1.0"],
] as const;

/** The live ScrollArea on its stage: native scrolling with glass scrollbars and edges that fade only where there is more. */
export function ScrollAreaScene({ scene }: { scene: ScrollAreaScene; ctx: StageContext }) {
  const reduced = useSheenReducedMotion();
  const viewport = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    node.scrollTo({ top: (node.scrollHeight - node.clientHeight) * scene.at, behavior: reduced ? "auto" : "smooth" });
  }, [scene.at, reduced]);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <ScrollArea
        className="h-52 w-full text-start"
        label="Release notes preview"
        scrollbars="always"
        viewportRef={viewport}
      >
        <ul className="m-0 flex list-none flex-col px-4 py-1">
          {NOTES.map(([note, version]) => (
            <li
              key={note}
              className="flex items-baseline justify-between gap-4 border-b border-sheen-border py-2.5 text-sm last:border-0"
            >
              <span>{note}</span>
              <span className="shrink-0 font-sheen-mono text-xs text-sheen-fg-muted">{version}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
