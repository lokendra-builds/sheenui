import type { Story } from "./ShowcaseStage";

/** The Typewriter stage's scene: which prompt is being typed (-1 none yet). */
export type TypewriterScene = { prompt: -1 | 0 | 1 };

/** An empty prompt box, a request is typed out, then a follow-up replaces it; the caret blinks and rests. */
const story: Story<TypewriterScene> = async ({ state, scene, wait }) => {
  await wait(600);
  scene({ prompt: 0 });
  state("working");
  await wait(2500);
  scene({ prompt: 1 });
  await wait(2100);
  state("success");
  await wait(700);
  state("idle");
};

export default story;
