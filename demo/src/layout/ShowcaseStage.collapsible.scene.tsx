import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { CollapsibleScene } from "./ShowcaseStage.collapsible";

/** The live Collapsible on its stage: one row that opens a list in place. */
export function CollapsibleScene({ scene }: { scene: CollapsibleScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full text-start">
        <CollapsibleTrigger>{open ? "Hide files" : "3 more files"}</CollapsibleTrigger>
        <CollapsiblePanel>
          <ul className="m-0 list-disc ps-5">
            <li>report-q1.pdf</li>
            <li>report-q2.pdf</li>
            <li>report-q3.pdf</li>
          </ul>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}
