import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Tilt card stage's scene: where the pointer is over the card (x and y, 0 to 1; null off it). */
export type TiltCardScene = { at: { x: number; y: number } | null };

/** A flat card, a pointer circles over it and the card leans toward it with a glare, then it leaves and the card settles. */
const story: Story<TiltCardScene> = async ({ state, scene, wait, reduced }) => {
  await wait(700);
  state("lit");
  await tween(wait, reduced, 0, 1, 3000, (t) => {
    const a = t * Math.PI * 2;
    scene({ at: { x: 0.5 + 0.38 * Math.sin(a), y: 0.5 - 0.34 * Math.cos(a) } });
  });
  await wait(400);
  scene({ at: null });
  state("idle");
  await wait(900);
};

export default story;
