import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { PopoverScene } from "./ShowcaseStage.popover";

/** The live Popover on its stage: a small rename form anchored to its button. It is non-modal; while the story plays it never takes focus. */
export function PopoverScene({ scene, ctx }: { scene: PopoverScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [name, setName] = useFollow(scene.name);
  const [draft, setDraft] = useFollow(scene.draft);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Document</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="glass" />}>{name}</PopoverTrigger>
        <PopoverContent data-stage-popup="" side="right" align="start" className="flex w-72 flex-col gap-3">
          <div>
            <PopoverTitle>Rename</PopoverTitle>
            <PopoverDescription>Teammates see the new name at once.</PopoverDescription>
          </div>
          <Input aria-label="Name" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setName(draft || name);
                setOpen(false);
                ctx.setState("success");
              }}
            >
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
