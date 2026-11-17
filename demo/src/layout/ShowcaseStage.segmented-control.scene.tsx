import { SegmentedControl } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { SegmentedScene } from "./ShowcaseStage.segmented-control";

const VIEWS = [
  { value: "list", label: "List" },
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar" },
];

const PREVIEW: Record<string, number[]> = {
  list: [100, 82, 90, 64],
  board: [34, 34, 34],
  calendar: [14, 14, 14, 14, 14, 14, 14],
};

/** The live SegmentedControl on its stage, with a small mock of the chosen view below it. */
export function SegmentedScene({ scene, ctx }: { scene: SegmentedScene; ctx: StageContext }) {
  const [view, setView] = useFollow<string>(scene.view);
  const bars = PREVIEW[view] ?? [];
  return (
    <div className="sheen-stage-col">
      <SegmentedControl
        aria-label="View"
        value={view}
        onValueChange={(next) => {
          setView(next);
          ctx.setState("success");
        }}
        items={VIEWS}
      />
      <div
        aria-hidden
        className="glass-1 flex h-20 w-full max-w-sm items-stretch gap-2 rounded-sheen-md p-3"
        style={{ flexDirection: view === "list" ? "column" : "row" }}
      >
        {bars.map((w, i) => (
          <span
            key={`${view}-${i}`}
            className="rounded-sheen-sm bg-sheen-accent/25"
            style={view === "list" ? { width: `${w}%`, flex: 1 } : { flex: 1 }}
          />
        ))}
      </div>
      <p className="sheen-stage-sub">
        Showing the <strong className="text-sheen-fg">{view}</strong> view
      </p>
    </div>
  );
}
