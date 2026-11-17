import type { Story } from "./ShowcaseStage";

/** The Rating stage's scene: the stars given. */
export type RatingScene = { value: number | null };

/** The stars light up one after another (the cascade) and settle on four. */
const story: Story<RatingScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  for (const value of [1, 2, 3, 4]) {
    scene({ value });
    await wait(240);
  }
  await wait(500);
  state("lit");
};

export default story;
