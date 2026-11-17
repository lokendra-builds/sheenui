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

import { useStageLayer } from "../../layout/ShowcaseStage.layer";
import type { StageContext } from "../../layout/ShowcaseStage";
import type { DialogScene } from "../../layout/ShowcaseStage.dialog";

/** The Dialog card's scene: the Dialog story, but the popup is portalled into the card's own stage layer (non-modal, no page scrim). */
export function DialogCardScene({ scene, ctx }: { scene: DialogScene; ctx: StageContext }) {
  const { layer, node } = useStageLayer(ctx.host);
  const sent = scene.step === 2;
  return (
    <div className="sheen-stage-col">
      {node}
      <p className="sheen-stage-title">Project members</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {sent ? <span className="sheen-stage-chip">2 invites sent</span> : "Maya and Jonas are not on the team yet."}
      </p>
      <Dialog open={scene.open} modal={false}>
        <DialogTrigger render={<Button />}>Invite teammates</DialogTrigger>
        <DialogContent
          container={layer}
          backdrop={false}
          initialFocus={false}
          className="w-[min(20rem,calc(100%-1.5rem))]! pointer-events-none"
        >
          <DialogHeader>
            <DialogTitle>{sent ? "Invites sent" : "Invite your team"}</DialogTitle>
            <DialogDescription>
              {sent
                ? "Maya and Jonas can open every project now."
                : "They get access to every project as soon as they accept."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {sent ? (
              <DialogClose render={<Button />}>Done</DialogClose>
            ) : (
              <>
                <DialogClose render={<Button variant="glass" />}>Cancel</DialogClose>
                <Button loading={scene.step === 1}>Send invites</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
