import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { TooltipScene } from "./ShowcaseStage.tooltip";

const TOOLS = [
  { label: "Bold", path: "M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" },
  { label: "Italic", path: "M14 5h-4M14 19h-4M14 5l-4 14" },
  { label: "Underline", path: "M7 4v7a5 5 0 0 0 10 0V4M5 20h14" },
];

/** The live Tooltips on their stage: a formatting toolbar whose tooltips open one after another. */
export function TooltipScene({ scene }: { scene: TooltipScene }) {
  const [open, setOpen] = useFollow(scene.open);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Format text</p>
      <TooltipProvider>
        <div className="glass-1 flex gap-1 rounded-sheen-full p-1">
          {TOOLS.map((tool, i) => (
            <Tooltip
              key={tool.label}
              content={<span data-stage-popup="">{tool.label}</span>}
              side="bottom"
              open={open === i}
              onOpenChange={(next) => setOpen(next ? (i as TooltipScene["open"]) : -1)}
            >
              <Button variant="ghost" size="icon" aria-label={tool.label} className="rounded-sheen-full">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={tool.path} />
                </svg>
              </Button>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
