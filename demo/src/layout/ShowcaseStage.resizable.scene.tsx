import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ResizableScene } from "./ShowcaseStage.resizable";

/** The live resizable panels on their stage: the divider can be dragged, or moved with the arrow keys. */
export function ResizableScene({ scene }: { scene: ResizableScene; ctx: StageContext }) {
  const [left, setLeft] = useFollow(scene.left);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <ResizablePanelGroup
        layout={[left, 100 - left]}
        onLayoutChange={(layout) => setLeft(layout[0] ?? left)}
        className="h-40 w-full text-start"
      >
        <ResizablePanel minSize={20} maxSize={75}>
          <p className="m-0 p-4 text-sm">Files {Math.round(left)}%</p>
        </ResizablePanel>
        <ResizableHandle withGrip />
        <ResizablePanel minSize={20}>
          <p className="m-0 p-4 text-sm">Editor {Math.round(100 - left)}%</p>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
