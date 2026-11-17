import type { Story } from "./ShowcaseStage";

/** The Drawer stage's scene: whether the sheet is open and the chosen filter ("" none yet). */
export type DrawerScene = { open: boolean; pick: "" | "Under $50"; applied: boolean };

/** The sheet rises from the stage's bottom edge, a filter is picked, Apply closes it and the result updates. */
const story: Story<DrawerScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: true });
  state("dim");
  await wait(1500);
  scene({ pick: "Under $50" });
  await wait(1000);
  scene({ open: false, applied: true });
  state("lit");
  await wait(1600);
  state("idle");
};

export default story;
