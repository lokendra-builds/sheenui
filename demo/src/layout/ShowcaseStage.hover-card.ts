import type { Story } from "./ShowcaseStage";

/** The Hover card stage's scene: whether the card is showing. */
export type HoverCardScene = { open: boolean };

/** The pointer rests on the @handle, the profile card opens beside it with the person's details, then it closes. */
const story: Story<HoverCardScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: true });
  state("lit");
  await wait(2600);
  scene({ open: false });
  state("idle");
  await wait(500);
};

export default story;
