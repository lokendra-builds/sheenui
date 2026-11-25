import type { Story } from "./ShowcaseStage";

/** The Command palette stage's scene: whether it is open, what was typed and the page that was jumped to. */
export type CommandPaletteScene = { open: boolean; query: string; went: string };

/** The palette opens, "set" is typed, results narrow to Settings, it is chosen and the stage shows the page. */
const story: Story<CommandPaletteScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ open: true });
  state("dim");
  await wait(900);
  for (const query of ["s", "se", "set"]) {
    scene({ query });
    await wait(220);
  }
  await wait(900);
  scene({ open: false, went: "Settings" });
  state("success");
  await wait(1600);
  state("idle");
};

export default story;
