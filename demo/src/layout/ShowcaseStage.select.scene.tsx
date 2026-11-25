import { Select } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { SelectScene } from "./ShowcaseStage.select";

const ITEMS = [
  { value: "react", label: "React", description: "UI library by Meta" },
  { value: "vue", label: "Vue", description: "Progressive framework" },
  { value: "svelte", label: "Svelte", description: "Compiler-first UI" },
];

/** The live Select on its stage. Base UI keeps it modal, so the story never opens it: it only pulses the field, and the list opens when the person clicks. */
export function SelectScene({ scene, ctx }: { scene: SelectScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [value, setValue] = useFollow(scene.value);
  const [nudge] = useFollow(scene.nudge ?? false);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Select
        label="Framework"
        description={nudge ? "Try it: open the list." : "\u00a0"}
        placeholder="Choose one"
        items={ITEMS}
        open={open}
        onOpenChange={setOpen}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          ctx.setState(next ? "success" : "idle");
        }}
        className="w-full text-start"
        triggerClassName={nudge ? "motion-safe:animate-pulse" : undefined}
      />
    </div>
  );
}
