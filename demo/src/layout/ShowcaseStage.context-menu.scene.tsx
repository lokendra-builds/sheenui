import { ContextMenu, ContextMenuContent, ContextMenuTrigger, MenuItem, MenuSeparator } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { nameStageMenu } from "./ShowcaseStage.hot";
import type { StageContext } from "./ShowcaseStage";
import type { ContextMenuScene } from "./ShowcaseStage.context-menu";

/**
 * The live ContextMenu on its stage. Base UI keeps it modal, so the story never opens it: it only pulses the photo,
 * and the menu opens when the person right-clicks (or presses the context-menu key).
 */
export function ContextMenuScene({ scene, ctx }: { scene: ContextMenuScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [picked, setPicked] = useFollow(scene.picked);
  const [nudge] = useFollow(scene.nudge ?? false);

  const pick = (name: string) => () => {
    setPicked(name);
    ctx.setState("success");
  };
  return (
    <div className="sheen-stage-col">
      <ContextMenu open={open} onOpenChange={setOpen}>
        <ContextMenuTrigger
          tabIndex={0}
          role="group"
          aria-label="Aurora.jpg. Right-click for actions."
          className={`relative h-28 w-full max-w-64 rounded-sheen-lg ${nudge ? "motion-safe:animate-pulse" : ""} [background-image:linear-gradient(150deg,#5b3fd6,#d946ef_55%,#22d3ee)]`}
        >
          <span className="absolute start-3 bottom-2 text-xs font-medium text-white">Aurora.jpg</span>
        </ContextMenuTrigger>
        <ContextMenuContent data-stage-menu="context" ref={nameStageMenu} className="w-48">
          <MenuItem shortcut="mod+c" onClick={pick("Copy")}>
            Copy
          </MenuItem>
          <MenuItem shortcut="mod+shift+s" onClick={pick("Share")}>
            Share
          </MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger" onClick={pick("Delete")}>
            Delete
          </MenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <p className="sheen-stage-sub sheen-stage-slot">
        {picked ? (
          <span className="sheen-stage-chip">{picked}: Aurora.jpg</span>
        ) : nudge ? (
          "Try it: right-click the photo."
        ) : (
          "Right-click the photo."
        )}
      </p>
    </div>
  );
}
