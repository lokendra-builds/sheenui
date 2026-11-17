import {
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogMedia,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { MorphingDialogScene as MorphingDialogSceneData } from "./ShowcaseStage.morphing-dialog";

const ART =
  "[background:radial-gradient(80%_60%_at_30%_20%,var(--sheen-chart-3),transparent_70%),radial-gradient(70%_70%_at_80%_40%,var(--sheen-chart-1),transparent_70%),linear-gradient(180deg,var(--sheen-ink-900),var(--sheen-ink-700))]";

function Art() {
  return (
    <span aria-hidden className={`relative block size-full ${ART}`}>
      <span className="absolute end-[12%] bottom-[16%] aspect-square w-[18%] rounded-full bg-sheen-accent-fg/75" />
    </span>
  );
}

/**
 * The live MorphingDialog on its stage. It is a real modal (Base UI's Dialog), so the story never opens it by itself:
 * it only pulses the card, and the dialog opens (with its scrim, as everywhere) when the person clicks.
 */
export function MorphingDialogScene({ scene }: { scene: MorphingDialogSceneData; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [nudge] = useFollow(scene.nudge ?? false);
  return (
    <MorphingDialog open={open} onOpenChange={setOpen}>
      <MorphingDialogTrigger className={`w-44 p-2 pb-3${nudge ? " motion-safe:animate-pulse" : ""}`}>
        <MorphingDialogMedia className="aspect-[4/3]">
          <Art />
        </MorphingDialogMedia>
        <MorphingDialogTitle className="px-1.5 pt-2">Aurora</MorphingDialogTitle>
        <MorphingDialogSubtitle className="px-1.5">Lofoten, Norway</MorphingDialogSubtitle>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="max-w-sm p-3 pb-5" initialFocus={false} finalFocus={false}>
        <MorphingDialogMedia className="aspect-[4/3]">
          <Art />
        </MorphingDialogMedia>
        <div className="px-2 pt-3">
          <MorphingDialogTitle>Aurora</MorphingDialogTitle>
          <MorphingDialogSubtitle>Lofoten, Norway</MorphingDialogSubtitle>
        </div>
        <MorphingDialogDescription className="px-2 pt-2 text-sm">
          Winter nights last almost all day, and the northern lights ripple green over the fjords.
        </MorphingDialogDescription>
        <MorphingDialogActions className="px-2 pt-3">
          <Button size="sm" onClick={() => setOpen(false)}>
            Plan a trip
          </Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}
