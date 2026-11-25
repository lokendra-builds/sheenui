import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Aspect ratio stage's scene: the box's width-to-height ratio. */
export type AspectRatioScene = { ratio: number };

/** The same picture box eases from wide to square to portrait; the picture keeps filling it. */
const story: Story<AspectRatioScene> = async ({ state, scene, wait, reduced }) => {
  await wait(900);
  state("working");
  await tween(wait, reduced, 16 / 9, 1, 700, (ratio) => scene({ ratio }));
  await wait(700);
  await tween(wait, reduced, 1, 4 / 5, 700, (ratio) => scene({ ratio }));
  state("lit");
  await wait(1500);
};

export default story;
