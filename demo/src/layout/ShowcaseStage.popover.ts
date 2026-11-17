import type { Story } from "./ShowcaseStage";

/** The Popover stage's scene: whether the panel is open, the document name and the name in the field. */
export type PopoverScene = { open: boolean; name: string; draft: string };

/** The panel opens, a new name is typed, Save closes it and the name on the button changes. */
const story: Story<PopoverScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  scene({ open: true });
  state("working");
  await wait(1200);
  for (const draft of ["Q3 roadmap v", "Q3 roadmap v2"]) {
    scene({ draft });
    await wait(300);
  }
  await wait(900);
  scene({ open: false, name: "Q3 roadmap v2" });
  state("idle");
  await wait(500);
};

export default story;
