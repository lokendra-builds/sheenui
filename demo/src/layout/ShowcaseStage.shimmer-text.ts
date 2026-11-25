import type { Story } from "./ShowcaseStage";

/** The Shimmer text stage's scene: whether the work is done. */
export type ShimmerTextScene = { done: boolean };

/** A status line shimmers while it works, then the finished line gets one sweep of light and rests. */
const story: Story<ShimmerTextScene> = async ({ state, scene, wait }) => {
  await wait(500);
  state("working");
  await wait(3200);
  scene({ done: true });
  state("success");
  await wait(2000);
  state("idle");
};

export default story;
