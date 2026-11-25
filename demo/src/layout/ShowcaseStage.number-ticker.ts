import type { Story } from "./ShowcaseStage";

/** The Number ticker stage's scene: the two figures on show. */
export type NumberTickerScene = { revenue: number; users: number };

/** The figures roll up from their old values, the revenue gets a second, smaller update, and the stage rests. */
const story: Story<NumberTickerScene> = async ({ state, scene, wait }) => {
  await wait(600);
  state("working");
  scene({ revenue: 48250 });
  await wait(450);
  scene({ users: 1284093 });
  await wait(1300);
  state("success");
  scene({ revenue: 51890 });
  await wait(1400);
  state("idle");
};

export default story;
