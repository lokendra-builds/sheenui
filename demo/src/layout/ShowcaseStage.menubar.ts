import type { Story } from "./ShowcaseStage";

/** The Menubar stage's scene: which menu is open ("" none), the highlighted row and the note's text size. */
export type MenubarScene = { menu: "" | "file" | "view"; hot: number | null; size: "sm" | "md" };

/** File opens, the pointer moves on and the neighbour View opens in its place, then a text size is chosen. */
const story: Story<MenubarScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ menu: "file" });
  await wait(1000);
  scene({ menu: "view" });
  await wait(900);
  scene({ hot: 1 });
  await wait(700);
  scene({ menu: "", hot: null, size: "md" });
  state("lit");
  await wait(1500);
  state("idle");
};

export default story;
