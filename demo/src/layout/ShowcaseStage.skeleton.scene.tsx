import { Avatar, Skeleton, SkeletonCircle, SkeletonGroup, SkeletonRect, SkeletonText } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { SkeletonScene } from "./ShowcaseStage.skeleton";

/** The live Skeleton on its stage: the same card, first as placeholders and then loaded, in the same box. */
export function SkeletonScene({ scene }: { scene: SkeletonScene; ctx: StageContext }) {
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      {scene.loaded ? (
        <article className="flex w-full flex-col gap-3 text-start">
          <div className="flex h-14 items-center gap-3">
            <Avatar name="Maya Chen" size="lg" />
            <div>
              <p className="sheen-stage-title">Maya Chen</p>
              <p className="sheen-stage-sub">Merged the redesign, 2 minutes ago.</p>
            </div>
          </div>
          <div className="h-24 rounded-sheen-lg bg-gradient-to-br from-violet-500 to-teal-300" />
          <p className="sheen-stage-sub h-10">Typography, spacing and glass tokens now come from one source.</p>
        </article>
      ) : (
        <SkeletonGroup role="none" labels={{ loading: "Loading profile" }} className="flex w-full flex-col gap-3">
          <div className="flex h-14 items-center gap-3">
            <SkeletonCircle size="lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton shape="text" width="45%" />
              <Skeleton shape="text" width="80%" />
            </div>
          </div>
          <SkeletonRect height={96} />
          <SkeletonText lines={2} size="sm" className="h-10" />
        </SkeletonGroup>
      )}
    </div>
  );
}
