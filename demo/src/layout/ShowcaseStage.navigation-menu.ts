import type { Story } from "./ShowcaseStage";

/** The Navigation menu stage's scene: which menu panel is open ("" none). */
export type NavigationMenuScene = { menu: "" | "products" | "developers" };

/** Products opens and then closes. It never hops to Developers on its own: the panel re-anchors at once under another trigger, and a jump of that size is a layout shift. */
const story: Story<NavigationMenuScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ menu: "products" });
  state("lit");
  await wait(2200);
  scene({ menu: "" });
  state("idle");
  await wait(400);
};

export default story;
