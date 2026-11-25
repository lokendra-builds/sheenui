import type { Story } from "./ShowcaseStage";

/** The Tooltip stage's scene: which toolbar button's tooltip is open (-1 none). */
export type TooltipScene = { open: -1 | 0 | 1 | 2 };

/** A tooltip opens over Bold, then moves to Italic and Underline with no delay between them. */
const story: Story<TooltipScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: 0 });
  state("lit");
  await wait(1100);
  scene({ open: 1 });
  await wait(900);
  scene({ open: 2 });
  await wait(1100);
  scene({ open: -1 });
  state("idle");
};

export default story;
