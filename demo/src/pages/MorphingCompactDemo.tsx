import {
  Avatar,
  Button,
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  useToast,
} from "@sheenui/theme";

/**
 * The "Compact card" demo of /effects/morphing-dialog. The page loads it as an island (lazyBlock), so the Avatar code
 * stays out of the page's initial JS (the example-page budget); the prerendered HTML already shows the finished card.
 */
export function MorphingCompactDemo() {
  const toast = useToast();
  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex-row items-center gap-3 p-3 pe-5">
        <Avatar name="Grace Hopper" />
        <span className="flex flex-col">
          <MorphingDialogTitle>Grace Hopper</MorphingDialogTitle>
          <MorphingDialogSubtitle>Rear admiral · Compilers</MorphingDialogSubtitle>
        </span>
      </MorphingDialogTrigger>
      <MorphingDialogContent className="max-w-md gap-1 p-6 pe-14">
        <MorphingDialogTitle>Grace Hopper</MorphingDialogTitle>
        <MorphingDialogSubtitle>Rear admiral · Compilers</MorphingDialogSubtitle>
        <MorphingDialogDescription className="mt-3">
          Wrote the first compiler and helped design COBOL, so programs could be written in words instead of machine
          code. She kept a moth taped in her logbook: the first actual bug.
        </MorphingDialogDescription>
        <MorphingDialogActions className="mt-4">
          <Button size="sm" onClick={() => toast.success("Following Grace Hopper")}>
            Follow
          </Button>
          <Button size="sm" variant="glass" onClick={() => toast.info("Message drafted")}>
            Message
          </Button>
        </MorphingDialogActions>
      </MorphingDialogContent>
    </MorphingDialog>
  );
}
