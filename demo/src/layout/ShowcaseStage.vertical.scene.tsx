import { VerticalNav, type VerticalNavSection } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { VerticalScene } from "./ShowcaseStage.vertical";

const icon = (d: string) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-[1.1rem]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const HEADLINE: Record<string, string> = {
  home: "3 reviews waiting.",
  inbox: "All caught up.",
  projects: "4 active projects.",
};

/** The live VerticalNav on its stage: the highlight glides between items and the Inbox badge clears. */
export function VerticalScene({ scene }: { scene: VerticalScene; ctx: StageContext }) {
  const [page, setPage] = useFollow<string>(scene.page);
  const [unread] = useFollow(scene.unread);
  const sections: VerticalNavSection[] = [
    {
      items: [
        { value: "home", label: "Home", icon: icon("M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
        {
          value: "inbox",
          label: "Inbox",
          icon: icon("M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z"),
          badge: unread || undefined,
        },
        { value: "projects", label: "Projects", icon: icon("M3 7h7l2 2h9v10H3z") },
      ],
    },
  ];
  return (
    <div className="sheen-stage-col">
      <VerticalNav aria-label="Workspace" sections={sections} value={page} onValueChange={setPage} className="w-full" />
      <p className="sheen-stage-sub sheen-stage-slot">
        {page === "inbox" && unread === 0 ? "Inbox zero." : HEADLINE[page]}
      </p>
    </div>
  );
}
