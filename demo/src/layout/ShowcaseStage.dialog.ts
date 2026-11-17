import type { Story } from "./ShowcaseStage";

/** The Dialog stage's scene: whether the dialog is open and how far the invite went (0 asking, 1 sending, 2 sent). */
export type DialogScene = { open: boolean; step: 0 | 1 | 2 };

/** The dialog opens while the stage dims, the invites are sent, the dialog closes and the stage rests on "sent". */
const story: Story<DialogScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: true });
  state("dim");
  await wait(2000);
  scene({ step: 1 });
  await wait(800);
  scene({ step: 2 });
  state("lit");
  await wait(1500);
  scene({ open: false });
  await wait(300);
  state("idle");
};

export default story;
