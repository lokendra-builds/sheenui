import type { Story } from "./ShowcaseStage";

/** The Kbd stage's scene: how many keys of the shortcut are held (0 to 2) and whether the search it opens is showing. */
export type KbdScene = { held: 0 | 1 | 2; opened: boolean };

/** The keys of the shortcut press down one after the other, the search opens, and the keys come up. */
const story: Story<KbdScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ held: 1 });
  await wait(450);
  scene({ held: 2 });
  state("lit");
  await wait(250);
  scene({ opened: true });
  state("success");
  await wait(1100);
  scene({ held: 0 });
  await wait(1400);
  state("idle");
};

export default story;
