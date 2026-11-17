import type { Story } from "./ShowcaseStage";

/** The Skeleton stage's scene: whether the content has loaded. */
export type SkeletonScene = { loaded: boolean };

/** Grey shapes hold the layout with one beam of light across them; the real card lands in the same box. */
const story: Story<SkeletonScene> = async ({ state, scene, wait }) => {
  state("working");
  await wait(3200);
  scene({ loaded: true });
  state("lit");
  await wait(1200);
};

export default story;
