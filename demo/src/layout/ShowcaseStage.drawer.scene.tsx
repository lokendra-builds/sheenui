import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { useStageLayer } from "./ShowcaseStage.layer";
import type { StageContext } from "./ShowcaseStage";
import type { DrawerScene } from "./ShowcaseStage.drawer";

const PRICES = ["Any price", "Under $50", "$50 to $200"] as const;

/** The live bottom Drawer on its stage: non-modal, rising from the stage's own bottom edge, with the stage dimmed behind it. */
export function DrawerScene({ scene, ctx }: { scene: DrawerScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [pick, setPick] = useFollow<string>(scene.pick || "Any price");
  const [applied, setApplied] = useFollow(scene.applied);
  const { layer, node } = useStageLayer(ctx.host);
  return (
    <div className="sheen-stage-col">
      {node}
      <p className="sheen-stage-title">Headphones</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {applied ? <span className="sheen-stage-chip">12 results, under $50</span> : "148 results"}
      </p>
      <Drawer
        open={open}
        modal={false}
        onOpenChange={(next) => {
          setOpen(next);
          ctx.setState(next ? "dim" : applied ? "success" : "idle");
        }}
      >
        <DrawerTrigger render={<Button variant="glass" />}>Filters</DrawerTrigger>
        <DrawerContent container={layer} initialFocus={false} className="pointer-events-auto">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the results.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <div role="radiogroup" aria-label="Price" className="flex flex-wrap gap-2">
              {PRICES.map((price) => (
                <Button
                  key={price}
                  role="radio"
                  aria-checked={pick === price}
                  size="sm"
                  variant={pick === price ? "primary" : "glass"}
                  onClick={() => setPick(price)}
                >
                  {price}
                </Button>
              ))}
            </div>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose
              render={<Button />}
              onClick={() => {
                setApplied(pick === "Under $50");
              }}
            >
              Apply
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
