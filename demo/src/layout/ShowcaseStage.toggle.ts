import type { Story } from "./ShowcaseStage";

/** The Toggle stage's scene: which formats are pressed. */
export type ToggleScene = { bold: boolean; italic: boolean; underline: boolean };

/** Three toggles are pressed one after another: each blooms its tint and the text below restyles at once. */
const story: Story<ToggleScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  scene({ bold: true });
  await wait(650);
  scene({ italic: true });
  await wait(650);
  scene({ underline: true });
  state("lit");
};

export default story;
