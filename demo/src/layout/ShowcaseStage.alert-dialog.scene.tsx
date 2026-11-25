import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { usePlaceOnStage } from "./ShowcaseStage.layer";
import { stageInitialFocus } from "./stage-focus";
import type { StageContext } from "./ShowcaseStage";
import type { AlertDialogScene } from "./ShowcaseStage.alert-dialog";

const findDialog = () => document.querySelector<HTMLElement>("[data-stage-dialog]");

/**
 * The live AlertDialog on its stage, centred on the stage (not the screen) with its scrim hidden: the stage's own dim
 * layer stands in. It portals to the body like every modal (Base UI then hides the whole app as one block; a portal inside
 * the page would hide its siblings one by one, including the heading and skip link), and `usePlaceOnStage` centres it. Base UI keeps an alert dialog modal, so the story never opens it: it only pulses the trigger, and
 * the dialog opens when the person clicks.
 */
export function AlertDialogScene({ scene, ctx }: { scene: AlertDialogScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [step, setStep] = useFollow(scene.step);
  const [nudge] = useFollow(scene.nudge ?? false);
  usePlaceOnStage(ctx.host, open, findDialog);
  const gone = step === 2;
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Aurora redesign</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {gone ? (
          <span className="sheen-stage-chip">Project deleted</span>
        ) : nudge ? (
          "Try it: click Delete project."
        ) : (
          "42 files, 6 collaborators."
        )}
      </p>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          ctx.setState(next ? "dim" : gone ? "success" : "idle");
        }}
      >
        <AlertDialogTrigger
          render={
            <Button variant="glass" disabled={gone} className={nudge ? "motion-safe:animate-pulse" : undefined} />
          }
        >
          Delete project
        </AlertDialogTrigger>
        <AlertDialogContent
          data-stage-dialog=""
          backdropClassName="hidden"
          initialFocus={stageInitialFocus}
          className="pointer-events-auto w-[min(23rem,calc(100vw-1.5rem))]"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Aurora redesign?</AlertDialogTitle>
            <AlertDialogDescription>
              Its 42 files go to the bin for 30 days. Collaborators lose access now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              closeOnClick={false}
              loading={step === 1}
              onClick={() => {
                setStep(1);
                ctx.setState("working");
                window.setTimeout(() => {
                  setStep(2);
                  setOpen(false);
                  ctx.setState("success");
                }, 900);
              }}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
