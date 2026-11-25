import { Combobox } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ComboboxScene } from "./ShowcaseStage.combobox";

const OPTIONS = [
  { value: "py", label: "Python", group: "Languages" },
  { value: "django", label: "Django", group: "Frameworks" },
  { value: "react", label: "React", group: "Frameworks" },
  { value: "temporal", label: "Temporal", group: "Infrastructure" },
  { value: "postgres", label: "PostgreSQL", group: "Infrastructure" },
];

/** The live multi-select Combobox on its stage: picks land as animated chips. */
export function ComboboxScene({ scene, ctx }: { scene: ComboboxScene; ctx: StageContext }) {
  const [picked, setPicked] = useFollow(scene.picked);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Combobox
        multiple
        label="Skills"
        placeholder="Search skills…"
        options={OPTIONS}
        value={picked}
        onValueChange={(next) => {
          setPicked(next);
          ctx.setState("idle");
        }}
        className="w-full text-start"
      />
    </div>
  );
}
