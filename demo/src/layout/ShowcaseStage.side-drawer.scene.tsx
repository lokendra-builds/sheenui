import {
  Avatar,
  Button,
  Input,
  SideDrawer,
  SideDrawerBody,
  SideDrawerClose,
  SideDrawerContent,
  SideDrawerDescription,
  SideDrawerFooter,
  SideDrawerHeader,
  SideDrawerTitle,
  SideDrawerTrigger,
} from "@sheenui/theme";
import type { CSSProperties } from "react";

import { useFollow } from "./ShowcaseStage.follow";
import { useStageLayer } from "./ShowcaseStage.layer";
import type { StageContext } from "./ShowcaseStage";
import type { SideDrawerScene } from "./ShowcaseStage.side-drawer";

/** The live SideDrawer on its stage: non-modal, sliding in from the stage's right edge, the stage dimmed behind it. */
export function SideDrawerScene({ scene, ctx }: { scene: SideDrawerScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [step, setStep] = useFollow(scene.step);
  const { layer, node } = useStageLayer(ctx.host);
  const saved = step === 2;
  return (
    <div className="sheen-stage-col">
      {node}
      <div className="flex items-center gap-3">
        <Avatar name="Maya Chen" />
        <div className="text-start">
          <p className="sheen-stage-title">Maya Chen</p>
          <p className="sheen-stage-sub">{saved ? "Design lead" : "Designer"}</p>
        </div>
      </div>
      <SideDrawer
        open={open}
        modal={false}
        onOpenChange={(next) => {
          setOpen(next);
          ctx.setState(next ? "dim" : saved ? "success" : "idle");
        }}
      >
        <SideDrawerTrigger render={<Button variant="glass" />}>Edit profile</SideDrawerTrigger>
        <SideDrawerContent
          container={layer}
          initialFocus={false}
          size="sm"
          style={{ "--sd-width": "min(17rem, calc(100% - 1.5rem))", pointerEvents: "auto" } as CSSProperties}
        >
          <SideDrawerHeader>
            <SideDrawerTitle>Edit profile</SideDrawerTitle>
            <SideDrawerDescription>Update Maya's role.</SideDrawerDescription>
          </SideDrawerHeader>
          <SideDrawerBody>
            <div className="flex flex-col gap-1.5 text-sm text-sheen-fg-muted">
              <span aria-hidden>Role</span>
              <Input aria-label="Role" defaultValue={saved ? "Design lead" : "Designer"} key={saved ? "s" : "e"} />
            </div>
          </SideDrawerBody>
          <SideDrawerFooter>
            <SideDrawerClose render={<Button variant="glass" />}>Cancel</SideDrawerClose>
            <Button
              loading={step === 1}
              onClick={() => {
                setStep(1);
                ctx.setState("working");
                window.setTimeout(() => {
                  setStep(2);
                  ctx.setState("success");
                  setOpen(false);
                }, 800);
              }}
            >
              Save
            </Button>
          </SideDrawerFooter>
        </SideDrawerContent>
      </SideDrawer>
    </div>
  );
}
