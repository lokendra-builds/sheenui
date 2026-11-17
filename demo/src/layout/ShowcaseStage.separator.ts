import type { Story } from "./ShowcaseStage";

/** The Separator stage's scene: 0 two sign-in buttons, 1 the labelled line appears, 2 the email form below it. */
export type SeparatorScene = { phase: 0 | 1 | 2 };

/** A sign-in card gains its "or" line, which tells the two ways in apart. */
const story: Story<SeparatorScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  scene({ phase: 1 });
  await wait(900);
  scene({ phase: 2 });
  state("idle");
  await wait(1200);
};

export default story;
