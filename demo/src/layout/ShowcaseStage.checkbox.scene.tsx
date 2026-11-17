import { Checkbox } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { CheckboxScene } from "./ShowcaseStage.checkbox";

const TASKS = ["Design", "Build", "Ship"];

/** The live Checkboxes on their stage: three tasks and an "All tasks" box that is indeterminate in between. */
export function CheckboxScene({ scene, ctx }: { scene: CheckboxScene; ctx: StageContext }) {
  const [done, setDone] = useFollow(scene.done);
  const all = done.every(Boolean);
  const some = done.some(Boolean);
  const apply = (next: CheckboxScene["done"]) => {
    setDone(next);
    ctx.setState(next.every(Boolean) ? "success" : "idle");
  };
  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="All tasks"
        checked={all}
        indeterminate={some && !all}
        onCheckedChange={(v) => apply([v, v, v])}
      />
      <div className="ms-8 flex flex-col gap-3">
        {TASKS.map((task, i) => (
          <Checkbox
            key={task}
            label={task}
            checked={done[i] ?? false}
            onCheckedChange={(v) => apply(done.map((d, j) => (j === i ? v : d)) as CheckboxScene["done"])}
          />
        ))}
      </div>
    </div>
  );
}
