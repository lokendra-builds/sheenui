import { Button, CommandPalette, KbdShortcut, type CommandItem } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { useStageLayer } from "./ShowcaseStage.layer";
import { stageInitialFocus } from "./stage-focus";
import type { StageContext } from "./ShowcaseStage";
import type { CommandPaletteScene } from "./ShowcaseStage.command-palette";

/** The live CommandPalette on its stage, placed near the stage's top (non-modal, no initial focus: the story never moves focus or locks the page). */
export function CommandPaletteScene({ scene, ctx }: { scene: CommandPaletteScene; ctx: StageContext }) {
  const { layer, node } = useStageLayer(ctx.host);
  const [open, setOpen] = useFollow(scene.open);
  const [query, setQuery] = useFollow(scene.query);
  const [went, setWent] = useFollow(scene.went);

  const go = (name: string) => () => {
    setWent(name);
    ctx.setState("success");
  };
  // Settings first, and no label that still matches "se" besides it: the story narrows to Settings, so every row that
  // drops out is below it and nothing moves (a row removed above a later group would pull that group up).
  const items: CommandItem[] = [
    {
      id: "settings",
      label: "Settings",
      keywords: ["preferences"],
      group: "Go to",
      shortcut: "mod+,",
      onSelect: go("Settings"),
    },
    { id: "dashboard", label: "Dashboard", group: "Go to", onSelect: go("Dashboard") },
    { id: "team", label: "Team members", group: "Go to", onSelect: go("Team") },
    { id: "export", label: "Export data", group: "Actions", onSelect: go("Export") },
  ];
  return (
    <div className="sheen-stage-col">
      {node}
      <p className="sheen-stage-title">Workspace</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {went ? <span className="sheen-stage-chip">Opened {went}</span> : "Jump anywhere without the mouse."}
      </p>
      <CommandPalette
        items={items}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) ctx.setState(went ? "success" : "idle");
        }}
        query={query}
        onQueryChange={setQuery}
        shortcut={false}
        modal={false}
        initialFocus={stageInitialFocus}
        container={layer}
        // A fixed height (not content-sized): the list narrows as "set" is typed, and a popup that follows its rows would resize and shift the footer.
        className="pointer-events-auto top-6 h-[min(21rem,calc(100%-3rem))] w-[min(40rem,calc(100%-1.5rem))] max-h-[calc(100%-3rem)]"
        trigger={
          <Button variant="glass" trailing={<KbdShortcut keys="mod+k" className="ms-3" />}>
            Search or jump to…
          </Button>
        }
      />
    </div>
  );
}
