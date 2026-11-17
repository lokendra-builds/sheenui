import type { Story } from "./ShowcaseStage";

/** The Side drawer stage's scene: whether the panel is open and how far the save went (0 editing, 1 saving, 2 saved). */
export type SideDrawerScene = { open: boolean; step: 0 | 1 | 2 };

/** The panel slides in over the stage, a change is saved, the panel closes and the row behind it updates. */
const story: Story<SideDrawerScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: true });
  state("dim");
  await wait(1700);
  scene({ step: 1 });
  state("working");
  await wait(900);
  scene({ step: 2 });
  state("success");
  await wait(900);
  scene({ open: false });
  await wait(1200);
  state("idle");
};

export default story;
