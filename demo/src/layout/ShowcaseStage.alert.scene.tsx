import { Alert, Button } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { AlertScene } from "./ShowcaseStage.alert";

const COPY = [
  { tone: "info", title: "Saving your draft", text: "Syncing 3 changes to the cloud." },
  { tone: "danger", title: "Could not save", text: "You are offline. Your changes are kept on this device." },
  { tone: "success", title: "All changes saved", text: "Your draft is up to date everywhere." },
] as const;

/** The live Alert on its stage: the same slot changes tone as the save goes wrong and then recovers. */
export function AlertScene({ scene, ctx }: { scene: AlertScene; ctx: StageContext }) {
  const [phase, setPhase] = useFollow(scene.phase);
  const copy = COPY[phase];
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Alert
        key={phase}
        role="none"
        tone={copy.tone}
        title={copy.title}
        className="w-full text-start"
        action={
          phase === 1 ? (
            <Button
              size="sm"
              variant="glass"
              onClick={() => {
                setPhase(2);
                ctx.setState("success");
              }}
            >
              Retry
            </Button>
          ) : undefined
        }
      >
        {copy.text}
      </Alert>
    </div>
  );
}
