import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Liquid glass stage's scene: where the lens is over the artwork (0 left edge, 1 right edge) and whether it is on. */
export type LiquidGlassScene = { x: number; lens: boolean };

/** The artwork is crisp and flat, a lens appears and slides across it, bending the lines and splitting colour at its rim, then it rests. */
const story: Story<LiquidGlassScene> = async ({ state, scene, wait, reduced }) => {
  await wait(600);
  scene({ lens: true, x: 0.1 });
  state("lit");
  await wait(500);
  await tween(wait, reduced, 0.1, 0.9, 2600, (x) => scene({ x }));
  await tween(wait, reduced, 0.9, 0.62, 900, (x) => scene({ x }));
  await wait(500);
  state("idle");
};

export default story;
