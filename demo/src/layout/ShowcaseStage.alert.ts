import type { Story } from "./ShowcaseStage";

/** The Alert stage's scene: 0 syncing (info), 1 failed (danger, with Retry), 2 synced (success). */
export type AlertScene = { phase: 0 | 1 | 2 };

/** An info alert while saving, a danger alert with a Retry action when it fails, then the success alert. */
const story: Story<AlertScene> = async ({ state, scene, wait }) => {
  await wait(700);
  state("working");
  await wait(1300);
  scene({ phase: 1 });
  state("error");
  await wait(2300);
  scene({ phase: 2 });
  state("success");
  await wait(500);
};

export default story;
