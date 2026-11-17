import type { Story } from "./ShowcaseStage";

/** The Checkbox stage's scene: which of the three tasks are ticked. */
export type CheckboxScene = { done: [boolean, boolean, boolean] };

/** Tasks are ticked one by one: "All tasks" goes indeterminate, then checks, and the stage turns green. */
const story: Story<CheckboxScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  state("working");
  scene({ done: [true, false, false] });
  await wait(900);
  scene({ done: [true, true, false] });
  await wait(900);
  scene({ done: [true, true, true] });
  state("success");
  await wait(800);
};

export default story;
