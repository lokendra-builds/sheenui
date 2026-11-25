import type { Story } from "./ShowcaseStage";

/** The chart stage's scene: whether the chart is on the plate (it is from the first frame, so the idle frame is never empty axes). */
export type ChartStageScene = { shown: boolean };

/** The chart is already on the plate; the light breathes in the chart's palette while it settles (Replay remounts it to draw it in again). */
const story: Story<ChartStageScene> = async ({ state, scene, wait }) => {
  state("working");
  scene({ shown: true });
  await wait(1800);
  state("idle");
};

export default story;
