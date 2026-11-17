import type { Story } from "./ShowcaseStage";

/** The Marquee stage's scene: whether the strip is moving. */
export type MarqueeScene = { running: boolean };

/** A still strip of logos starts to glide, runs for a few seconds, then eases to a stop with the Pause button showing "Play". */
const story: Story<MarqueeScene> = async ({ state, scene, wait }) => {
  await wait(700);
  scene({ running: true });
  state("lit");
  await wait(3800);
  scene({ running: false });
  state("idle");
};

export default story;
