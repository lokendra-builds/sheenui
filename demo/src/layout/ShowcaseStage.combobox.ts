import type { Story } from "./ShowcaseStage";

/** The Combobox stage's scene: the picked skills (values), in order. */
export type ComboboxScene = { picked: string[] };

/** Three skills are picked one after another and land as chips. */
const story: Story<ComboboxScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  state("working");
  scene({ picked: ["py"] });
  await wait(1000);
  scene({ picked: ["py", "django"] });
  await wait(1000);
  scene({ picked: ["py", "django", "react"] });
  state("idle");
  await wait(500);
};

export default story;
