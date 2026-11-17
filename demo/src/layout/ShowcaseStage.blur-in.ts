import type { Story } from "./ShowcaseStage";

/** The Blur in stage's scene: whether the headline and the line under it have been revealed. */
export type BlurInScene = { headline: boolean; sub: boolean };

/** An empty stage, then the headline sharpens out of a blur word by word, then a line follows letter by letter. */
const story: Story<BlurInScene> = async ({ state, scene, wait }) => {
  await wait(700);
  scene({ headline: true });
  state("lit");
  await wait(1700);
  scene({ sub: true });
  await wait(2100);
  state("idle");
};

export default story;
