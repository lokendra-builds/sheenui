import type { Story } from "./ShowcaseStage";

/** The Animated beam stage's scene: "idle" nothing connected, "run" beams travel from three sources to the hub, "rest" they hold still, all synced. */
export type AnimatedBeamScene = { run: "idle" | "run" | "rest" };

/** Three sources are idle, then beams of light travel to the hub, then hold still once everything is synced. */
const story: Story<AnimatedBeamScene> = async ({ state, scene, wait }) => {
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
