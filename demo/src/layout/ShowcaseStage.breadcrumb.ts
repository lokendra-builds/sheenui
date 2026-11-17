import type { Story } from "./ShowcaseStage";

/** The Breadcrumb stage's scene: how deep the trail goes. */
export type BreadcrumbScene = { depth: number };

/** The trail deepens one page at a time; past four items the middle folds into a menu. */
const story: Story<BreadcrumbScene> = async ({ state, scene, wait }) => {
  await wait(900);
  for (const depth of [4, 5, 6]) {
    scene({ depth });
    await wait(900);
  }
  state("lit");
  await wait(1000);
};

export default story;
