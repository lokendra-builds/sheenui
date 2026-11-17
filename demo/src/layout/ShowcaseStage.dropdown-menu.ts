import type { Story } from "./ShowcaseStage";

/** The Dropdown menu stage's scene: whether the menu is open, the highlighted row and the chosen action. */
export type DropdownMenuScene = { open: boolean; hot: number | null; picked: string };

/** The menu opens under the button, the highlight glides to Billing, Billing is chosen and the stage confirms it. */
const story: Story<DropdownMenuScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: true });
  await wait(800);
  scene({ hot: 0 });
  await wait(500);
  scene({ hot: 1 });
  await wait(700);
  scene({ open: false, hot: null, picked: "Billing" });
  state("idle");
  await wait(1500);
  state("idle");
};

export default story;
