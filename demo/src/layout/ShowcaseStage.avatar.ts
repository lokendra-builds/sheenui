import type { Story } from "./ShowcaseStage";

/** The Avatar stage's scene: how many teammates are online (the first ones in the row). */
export type AvatarScene = { online: number };

/** The team starts offline; the presence dots turn on one by one. */
const story: Story<AvatarScene> = async ({ state, scene, wait }) => {
  await wait(700);
  state("working");
  for (let n = 1; n <= 4; n += 1) {
    scene({ online: n });
    await wait(900);
  }
  state("idle");
  await wait(500);
};

export default story;
