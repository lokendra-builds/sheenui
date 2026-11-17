import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Resizable stage's scene: percent of the width the sidebar takes. */
export type ResizableScene = { left: number };

/** The divider slides a little way out to give the sidebar room, then back (a short travel: every pixel of a layout resize counts as a shift), while both panels keep their content. */
const story: Story<ResizableScene> = async ({ state, scene, wait, reduced }) => {
  await wait(900);
  state("working");
  await tween(wait, reduced, 50, 60, 500, (left) => scene({ left }));
  await wait(500);
  await tween(wait, reduced, 60, 40, 800, (left) => scene({ left }));
  state("idle");
  await wait(1300);
};

export default story;
