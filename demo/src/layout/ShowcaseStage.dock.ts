import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Dock stage's scene: where the pointer is along the dock (0 to 1, null off it) and whether Mail has been opened. */
export type DockScene = { at: number | null; opened: boolean };

/** A flat bar of apps, a pointer glides along it and the icons swell and part, then Mail is opened and the dock rests. */
const story: Story<DockScene> = async ({ state, scene, wait, reduced }) => {
  await wait(700);
  state("lit");
  await tween(wait, reduced, 0.08, 0.92, 2300, (at) => scene({ at }));
  await tween(wait, reduced, 0.92, 0.3, 900, (at) => scene({ at }));
  await wait(250);
  scene({ opened: true });
  await wait(700);
  scene({ at: null });
  state("idle");
  await wait(400);
};

export default story;
