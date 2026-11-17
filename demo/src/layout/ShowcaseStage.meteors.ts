import type { Story } from "./ShowcaseStage";

/** The Meteors stage's scene: "idle" no streaks, "run" streaks cross the card, "rest" they hold still. */
export type MeteorsScene = { run: "idle" | "run" | "rest" };

/** A plain card, then streaks cross it now and then, then they hold still. */
const story: Story<MeteorsScene> = async ({ state, scene, wait }) => {
  await wait(700);
  scene({ run: "run" });
  state("lit");
  await wait(3800);
  scene({ run: "rest" });
  state("success");
  await wait(1200);
  state("idle");
};

export default story;
