import type { Story } from "./ShowcaseStage";

/** The Progress stage's scene: percent done. */
export type ProgressScene = { value: number };

/** The upload climbs in uneven steps (the stage light breathes), reaches 100 and turns green. */
const story: Story<ProgressScene> = async ({ state, scene, wait }) => {
  await wait(700);
  state("working");
  for (const value of [12, 31, 38, 57, 72, 88, 100]) {
    scene({ value });
    await wait(value === 38 ? 650 : 380);
  }
  state("success");
};

export default story;
