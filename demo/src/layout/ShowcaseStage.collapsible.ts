import type { Story } from "./ShowcaseStage";

/** The Collapsible stage's scene: whether the list is open. */
export type CollapsibleScene = { open: boolean };

/** A long list hides behind one row; it opens in place. */
const story: Story<CollapsibleScene> = async ({ state, scene, wait }) => {
  await wait(1800);
  scene({ open: true });
  state("lit");
  await wait(1200);
};

export default story;
