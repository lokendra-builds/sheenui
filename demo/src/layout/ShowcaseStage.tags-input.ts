import type { Story } from "./ShowcaseStage";

/** The Tags input stage's scene: the tags added so far. */
export type TagsInputScene = { tags: string[] };

/** Three tags are typed in, one by one: each springs in as a chip. */
const story: Story<TagsInputScene> = async ({ state, scene, wait }) => {
  const tags = ["design", "motion", "glass", "a11y"];
  await wait(900);
  state("working");
  for (let i = 2; i <= tags.length; i += 1) {
    scene({ tags: tags.slice(0, i) });
    await wait(650);
  }
  state("idle");
};

export default story;
