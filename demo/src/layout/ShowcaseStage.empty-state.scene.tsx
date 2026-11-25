import { Button, EmptyState } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { EmptyStateScene } from "./ShowcaseStage.empty-state";

const folder = (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

/** The live EmptyState on its stage: one clear next step, and what replaces it once it is taken. */
export function EmptyStateScene({ scene }: { scene: EmptyStateScene; ctx: StageContext }) {
  const [added, setAdded] = useFollow(scene.added);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      {added ? (
        <ul className="sheen-stage-feed m-0 w-full list-none p-0 text-start">
          <li className="glass-1 rounded-sheen-lg p-4">
            <p className="sheen-stage-title">My first project</p>
            <p className="sheen-stage-sub">Created just now</p>
          </li>
        </ul>
      ) : (
        <EmptyState
          variant="compact"
          surface="dashed"
          className="w-full"
          icon={folder}
          headingLevel="none"
          title="No projects yet"
          description="Projects keep your screens and tokens together."
          action={
            <Button size="sm" data-stage-pressed={scene.pressed ? "" : undefined} onClick={() => setAdded(true)}>
              New project
            </Button>
          }
        />
      )}
    </div>
  );
}
