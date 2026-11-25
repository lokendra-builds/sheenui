import type { Story } from "./ShowcaseStage";

/** The Empty state stage's scene: whether the first project has been made, and the button's press. */
export type EmptyStateScene = { pressed: boolean; added: boolean };

/** Nothing here yet; the one clear action is pressed and the list takes its place. */
const story: Story<EmptyStateScene> = async ({ state, scene, wait }) => {
  await wait(1700);
  scene({ pressed: true });
  await wait(450);
  scene({ pressed: false, added: true });
  state("success");
  await wait(1200);
};

export default story;
