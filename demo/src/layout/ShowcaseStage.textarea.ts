import type { Story } from "./ShowcaseStage";

/** The Textarea stage's scene: the text written so far. */
export type TextareaScene = { text: string };

/** The note being written. */
export const NOTE = "Loved the quiet room and the late checkout. Breakfast was lovely too, thank you!";

/** A note is typed word by word: the field grows and the counter ring fills. */
const story: Story<TextareaScene> = async ({ state, scene, wait }) => {
  await wait(800);
  state("working");
  const words = NOTE.split(" ");
  for (let i = 1; i <= words.length; i += 1) {
    scene({ text: words.slice(0, i).join(" ") });
    await wait(150);
  }
  await wait(400);
  state("warning");
};

export default story;
