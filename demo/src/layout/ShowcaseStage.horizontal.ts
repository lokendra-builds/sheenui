import type { Story } from "./ShowcaseStage";

/** The Horizontal nav stage's scene: the active page. */
export type HorizontalScene = { page: "home" | "work" | "pricing" };

/** The highlight morphs from Home to Work to Pricing, and the page below follows. */
const story: Story<HorizontalScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  scene({ page: "work" });
  await wait(1100);
  scene({ page: "pricing" });
  await wait(900);
  state("idle");
  await wait(1500);
  state("idle");
};

export default story;
