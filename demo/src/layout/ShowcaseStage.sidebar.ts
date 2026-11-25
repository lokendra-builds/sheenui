import type { Story } from "./ShowcaseStage";

/** The Sidebar stage's scene: the active project and whether the rail is collapsed. */
export type SidebarScene = { active: "alpha" | "beta" | "gamma"; collapsed: boolean };

/** The active project moves to Beta, then the sidebar folds to a rail of icons and back out. */
const story: Story<SidebarScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ active: "beta" });
  state("working");
  await wait(1100);
  scene({ collapsed: true });
  await wait(1500);
  scene({ collapsed: false });
  state("lit");
  await wait(1300);
  state("idle");
};

export default story;
