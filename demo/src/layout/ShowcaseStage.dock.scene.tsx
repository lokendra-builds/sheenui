import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dock, DockItem } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { useVirtualPointer } from "./ShowcaseStage.pointer";
import type { StageContext } from "./ShowcaseStage";
import type { DockScene } from "./ShowcaseStage.dock";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
const FolderIcon = () => (
  <Glyph>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Glyph>
);
const MailIcon = () => (
  <Glyph>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Glyph>
);
const CalendarIcon = () => (
  <Glyph>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4M16 2v4M3 10h18" />
  </Glyph>
);
const MusicIcon = () => (
  <Glyph>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </Glyph>
);
const CameraIcon = () => (
  <Glyph>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </Glyph>
);

const TILE = {
  files: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]",
  mail: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-3))]",
  calendar: "[background:linear-gradient(160deg,var(--sheen-chart-8),var(--sheen-chart-2))]",
  music: "[background:linear-gradient(160deg,var(--sheen-chart-5),var(--sheen-chart-8))]",
  photos: "[background:linear-gradient(160deg,var(--sheen-chart-4),var(--sheen-chart-2))]",
} as const;

/** The live Dock on its stage: a pointer (the story's) glides along it and the icons swell; Mail opens and bounces. */
export function DockScene({ scene }: { scene: DockScene; ctx: StageContext }) {
  const [opened, setOpened] = useFollow(scene.opened);
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  const clicked = useRef(false);
  useVirtualPointer(scope, "[data-slot='dock'], [role='toolbar']", scene.at === null ? null : { x: scene.at, y: 0.5 });

  // The story opens Mail the way a person would: a real click, so the icon bounces.
  useEffect(() => {
    if (!scene.opened || clicked.current || !scope) return;
    clicked.current = true;
    scope
      .querySelectorAll<HTMLElement>("[data-dock-item] > button, [data-dock-item] > a, [data-dock-item] button")[1]
      ?.click();
  }, [scene.opened, scope]);

  return (
    <div ref={setScope} className="flex min-h-28 w-full items-end justify-center">
      <Dock label="Apps" labels={{ active: "open" }} size="sm">
        <DockItem label="Files" icon={<FolderIcon />} active tileClassName={`${TILE.files} text-sheen-accent-fg`} />
        <DockItem
          label="Mail"
          icon={<MailIcon />}
          active={opened}
          badge={opened ? undefined : 3}
          badgeLabel={opened ? undefined : "3 unread"}
          bounce
          onClick={() => setOpened(true)}
          tileClassName={`${TILE.mail} text-sheen-accent-fg`}
        />
        <DockItem label="Calendar" icon={<CalendarIcon />} tileClassName={`${TILE.calendar} text-sheen-accent-fg`} />
        <DockItem label="Music" icon={<MusicIcon />} tileClassName={`${TILE.music} text-sheen-accent-fg`} />
        <DockItem label="Photos" icon={<CameraIcon />} tileClassName={`${TILE.photos} text-sheen-accent-fg`} />
      </Dock>
    </div>
  );
}
