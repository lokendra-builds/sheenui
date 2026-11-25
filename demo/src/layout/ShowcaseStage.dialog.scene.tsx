import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { useStageLayer } from "./ShowcaseStage.layer";
import { stageInitialFocus } from "./stage-focus";
import type { StageContext } from "./ShowcaseStage";
import type { DialogScene } from "./ShowcaseStage.dialog";

/** The live Dialog on its stage. It is not modal here (the page stays usable) and is centred on the stage, not the screen. */
export function DialogScene({ scene, ctx }: { scene: DialogScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [step, setStep] = useFollow(scene.step);
  const { setState } = ctx;
  // The popup lives in a layer over the stage (position: fixed there is relative to the stage), so it scrolls with the
  // page natively: no script follows the scroll a frame late, which shifted it.
  const { layer, node } = useStageLayer(ctx.host);

  const sent = step === 2;
  return (
    <div className="sheen-stage-col">
      {node}
      <p className="sheen-stage-title">Project members</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {sent ? <span className="sheen-stage-chip">2 invites sent</span> : "Maya and Jonas are not on the team yet."}
      </p>
      <Dialog
        open={open}
        modal={false}
        onOpenChange={(next) => {
          setOpen(next);
          setState(next ? "dim" : sent ? "lit" : "idle");
        }}
      >
        <DialogTrigger render={<Button />}>Invite teammates</DialogTrigger>
        <DialogContent
          container={layer}
          initialFocus={stageInitialFocus}
          backdrop={false}
          className="sheen-stage-dialog pointer-events-auto"
        >
          <DialogHeader>
            <DialogTitle>{sent ? "Invites sent" : "Invite your team"}</DialogTitle>
            <DialogDescription className="sheen-stage-desc">
              {sent
                ? "Maya and Jonas can open every project now."
                : "They get access to every project as soon as they accept."}
            </DialogDescription>
          </DialogHeader>
          <p className="sheen-stage-sub">maya@example.com, jonas@example.com</p>
          <DialogFooter>
            {sent ? (
              <DialogClose key="done" render={<Button />}>
                Done
              </DialogClose>
            ) : (
              <>
                <DialogClose render={<Button variant="glass" />}>Cancel</DialogClose>
                <Button
                  loading={step === 1}
                  onClick={() => {
                    setStep(2);
                    setState("success");
                  }}
                >
                  Send invites
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
