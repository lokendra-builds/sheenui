import type { Story } from "./ShowcaseStage";

/** The Chat view stage's scene: 0 nothing sent, 1 sending, 2 sent, 3 read and Riya is typing, 4 her reply has landed. */
export type ChatThreadScene = { step: 0 | 1 | 2 | 3 | 4 };

/** A message is sent and its ticks climb (sending, sent, read), Riya types, and her reply lands under it. */
const story: Story<ChatThreadScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ step: 1 });
  state("working");
  await wait(700);
  scene({ step: 2 });
  await wait(800);
  scene({ step: 3 });
  await wait(1600);
  scene({ step: 4 });
  state("success");
  await wait(1200);
  state("idle");
};

export default story;
