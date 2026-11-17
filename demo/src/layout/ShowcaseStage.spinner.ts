import type { Story } from "./ShowcaseStage";

/** The Spinner stage's scene: whether the work is done. */
export type SpinnerScene = { done: boolean };

/** The spinner turns while work of unknown length runs, then it is removed and a check says it is done. */
const story: Story<SpinnerScene> = async ({ state, scene, wait }) => {
  await wait(500);
  state("working");
  await wait(3200);
  scene({ done: true });
  state("success");
  await wait(800);
};

export default story;
