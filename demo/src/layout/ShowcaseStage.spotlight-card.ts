import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Spotlight card stage's scene: where the pointer is over the pair of cards (x and y, 0 to 1; null off them). */
export type SpotlightCardScene = { at: { x: number; y: number } | null };

/** Two flat cards, a pointer drifts across them and the glow and rims follow it, then it leaves and the glow rests. */
const story: Story<SpotlightCardScene> = async ({ state, scene, wait, reduced }) => {
  await wait(700);
  state("lit");
  await tween(wait, reduced, 0.1, 0.9, 2600, (t) => scene({ at: { x: t, y: 0.35 + 0.3 * Math.sin(t * Math.PI) } }));
  await wait(500);
  await tween(wait, reduced, 0.9, 0.55, 800, (t) => scene({ at: { x: t, y: 0.55 } }));
  await wait(600);
  scene({ at: null });
  state("idle");
  await wait(300);
};

export default story;
