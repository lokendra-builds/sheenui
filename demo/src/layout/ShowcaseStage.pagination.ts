import type { Story } from "./ShowcaseStage";

/** The Pagination stage's scene: the current page. */
export type PaginationScene = { page: number };

/** The bar clicks through pages, jumps into the middle of a long list and keeps its width. */
const story: Story<PaginationScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  for (const page of [2, 3, 12, 24]) {
    scene({ page });
    await wait(page === 3 ? 900 : 700);
  }
  state("idle");
  await wait(800);
};

export default story;
