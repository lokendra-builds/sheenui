import type { Story } from "./ShowcaseStage";

/** The Stepper stage's scene: the current step (3 means every step is done). */
export type StepperScene = { current: number };

/** The flow advances step by step, the line fills with the accent, and the last step completes. */
const story: Story<StepperScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  for (const current of [1, 2, 3]) {
    scene({ current });
    await wait(1000);
  }
  state("success");
  await wait(800);
};

export default story;
