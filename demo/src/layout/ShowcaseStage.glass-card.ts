import type { Story } from "./ShowcaseStage";

/** The Glass card stage's scene: the card's depth level and whether it is tinted. */
export type GlassCardScene = { level: 1 | 2 | 3; tint: boolean };

/** The same card steps up through the three glass levels, then picks up the accent tint. */
const story: Story<GlassCardScene> = async ({ state, scene, wait }) => {
  await wait(1300);
  scene({ level: 2 });
  await wait(1300);
  scene({ level: 3 });
  state("lit");
  await wait(1000);
  scene({ tint: true });
  state("idle");
  await wait(600);
};

export default story;
