import type { Story } from "./ShowcaseStage";

/** The Segmented control stage's scene: the chosen view. */
export type SegmentedScene = { view: "list" | "board" | "calendar" };

/** The glass pill slides from List to Board to Calendar and the view below changes with it. */
const story: Story<SegmentedScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  scene({ view: "board" });
  await wait(1200);
  scene({ view: "calendar" });
  state("lit");
};

export default story;
