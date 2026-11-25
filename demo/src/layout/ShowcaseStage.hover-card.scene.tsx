import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { HoverCardScene } from "./ShowcaseStage.hover-card";

/** The live HoverCard on its stage: opened by the story, and by hover or focus when the person tries it. */
export function HoverCardScene({ scene, ctx }: { scene: HoverCardScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  return (
    <div className="sheen-stage-col">
      {/* On phones the card opens above the link: leave it room inside the stage. */}
      <div aria-hidden className="h-24 sm:hidden" />
      <p className="text-sm text-sheen-fg-muted">
        Reviewed by{" "}
        <HoverCard
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            ctx.setState(next ? "lit" : "idle");
          }}
        >
          <HoverCardTrigger href="#mira">@mira.designs</HoverCardTrigger>
          <HoverCardContent data-stage-popup="" side="right">
            <ProfilePreview
              name="Mira Okafor"
              handle="mira.designs"
              status="online"
              badge={<Badge tone="accent">Design lead</Badge>}
              bio="Design systems at Acme. Reviews every motion curve twice."
              stats={[
                { label: "followers", value: 3210 },
                { label: "following", value: 412 },
              ]}
            />
          </HoverCardContent>
        </HoverCard>
        , approved yesterday.
      </p>
    </div>
  );
}
