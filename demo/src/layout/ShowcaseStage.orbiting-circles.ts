import type { Story } from "./ShowcaseStage";

/** The Orbiting circles stage's scene: "idle" the ring holds its start positions, "run" the rings turn, "rest" they hold still. */
export type OrbitingCirclesScene = { run: "idle" | "run" | "rest" };

/** Two rings of integrations sit still, turn for a few seconds, then hold still again. */
const story: Story<OrbitingCirclesScene> = async ({ state, scene, wait }) => {
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
