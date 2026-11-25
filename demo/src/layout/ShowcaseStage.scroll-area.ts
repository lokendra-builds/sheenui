import type { Story } from "./ShowcaseStage";

/** The Scroll area stage's scene: how far down the list is, from 0 (top) to 1 (end). */
export type ScrollAreaScene = { at: number };

/** The list scrolls to the middle and then the end: the top edge fades in, the bottom edge fades away at the end. */
const story: Story<ScrollAreaScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  state("working");
  scene({ at: 0.5 });
  await wait(1500);
  scene({ at: 1 });
  await wait(1200);
  state("idle");
  await wait(900);
};

export default story;
