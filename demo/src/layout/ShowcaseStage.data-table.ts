import type { Story } from "./ShowcaseStage";

/** The DataTable stage's scene: which column the rows are sorted by. */
export type DataTableScene = { sort: "none" | "amount" | "name" };

/** The rows slide into a new order: by amount (largest first), then by name, then back to the start. */
const story: Story<DataTableScene> = async ({ state, scene, wait }) => {
  await wait(1200);
  state("working");
  scene({ sort: "amount" });
  await wait(1800);
  scene({ sort: "name" });
  await wait(1800);
  state("success");
  await wait(600);
};

export default story;
