import type { Story } from "./ShowcaseStage";

/** The Switch stage's scene. */
export type SwitchScene = { on: boolean };

/** The stage starts almost dark; the switch turns on and a warm light fills it. */
const story: Story<SwitchScene> = async ({ state, scene, wait }) => {
  await wait(1200);
  scene({ on: true });
  state("lit");
};

export default story;
