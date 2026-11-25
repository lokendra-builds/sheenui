import type { Story } from "./ShowcaseStage";

/** The Toast stage's scene: which beat of the release the toasts are on (0 nothing yet, 5 the release is live). */
export type ToastScene = { step: 0 | 1 | 2 | 3 | 4 | 5 };

/** Build passes, deploy fails (red light, a Retry toast), retry turns the pipeline green and the release toast lands. */
const story: Story<ToastScene> = async ({ state, scene, wait }) => {
  await wait(700);
  scene({ step: 1 });
  state("success");
  await wait(1200);
  scene({ step: 2 });
  state("working");
  await wait(1100);
  scene({ step: 3 });
  state("error");
  await wait(1800);
  scene({ step: 4 });
  state("working");
  await wait(1100);
  scene({ step: 5 });
  state("success");
};

export default story;
