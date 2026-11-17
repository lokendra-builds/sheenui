import type { Story } from "./ShowcaseStage";

/** The Particles stage's scene: "idle" no field, "run" the field drifts behind glass, "rest" it holds still. */
export type ParticlesScene = { run: "idle" | "run" | "rest" };

/** A bare card, then a field of light fades in and drifts behind it, then holds still. */
const story: Story<ParticlesScene> = async ({ state, scene, wait }) => {
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
