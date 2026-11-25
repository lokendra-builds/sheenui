import type { Story } from "./ShowcaseStage";

/** The Toolbar stage's scene: the formatting toggles that are on. */
export type ToolbarScene = { styles: string };

/** Bold, italic and underline switch on one after another and the sentence below takes each one. */
const story: Story<ToolbarScene> = async ({ state, scene, wait }) => {
  await wait(900);
  for (const styles of ["bold", "bold,italic", "bold,italic,underline"]) {
    scene({ styles });
    await wait(800);
  }
  state("lit");
  await wait(1300);
};

export default story;
