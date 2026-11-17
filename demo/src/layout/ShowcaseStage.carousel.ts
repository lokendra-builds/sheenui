import type { Story } from "./ShowcaseStage";

/** The Carousel stage's scene: the slide in view. */
export type CarouselScene = { index: number };

/** Two flicks through the gallery, then it rests: no autoplay on the stage. */
const story: Story<CarouselScene> = async ({ state, scene, wait }) => {
  await wait(1100);
  scene({ index: 1 });
  await wait(1500);
  scene({ index: 2 });
  state("lit");
  await wait(1200);
};

export default story;
