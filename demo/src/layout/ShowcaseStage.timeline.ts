import type { Story } from "./ShowcaseStage";

/** The Timeline stage's scene: how many events have happened. */
export type TimelineScene = { count: number };

/** The parcel's events arrive one by one, the line draws on to the next, and the last one lands green. */
const story: Story<TimelineScene> = async ({ state, scene, wait }) => {
  await wait(800);
  state("working");
  for (const count of [2, 3, 4]) {
    scene({ count });
    await wait(1000);
  }
  state("idle");
  await wait(800);
};

export default story;
