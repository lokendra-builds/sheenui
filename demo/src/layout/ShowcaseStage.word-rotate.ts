import type { Story } from "./ShowcaseStage";

/** The Word rotate stage's scene: which word the slot shows. */
export type WordRotateScene = { index: number };

/** The slot slides through the words one by one and stops on the last. */
const story: Story<WordRotateScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("lit");
  for (const index of [1, 2, 3]) {
    scene({ index });
    await wait(1250);
  }
  await wait(400);
  state("idle");
};

export default story;
