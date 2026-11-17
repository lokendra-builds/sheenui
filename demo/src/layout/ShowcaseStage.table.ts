import type { Story } from "./ShowcaseStage";

/** The Table stage's scene: how many invoices are paid. */
export type TableScene = { paid: number };

/** Invoices settle one at a time: each status flips and the total at the bottom follows. */
const story: Story<TableScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  state("working");
  for (const paid of [1, 2, 3]) {
    scene({ paid });
    await wait(850);
  }
  state("success");
  await wait(1000);
};

export default story;
