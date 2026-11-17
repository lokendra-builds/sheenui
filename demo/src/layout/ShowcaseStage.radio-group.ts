import type { Story } from "./ShowcaseStage";

/** The Radio group stage's scene: the chosen plan. */
export type RadioGroupScene = { plan: string };

/** The choice moves from one plan to the next: the dot slides and the summary follows. */
const story: Story<RadioGroupScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  scene({ plan: "pro" });
  await wait(1100);
  scene({ plan: "team" });
  state("lit");
};

export default story;
