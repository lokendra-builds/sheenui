import type { Story } from "./ShowcaseStage";

/** The Field stage's scene: what is typed in the email field and whether it has been left once. */
export type FieldScene = { email: string; touched: boolean };

const typed = async (text: string, from: number, set: (v: string) => void, wait: (ms: number) => Promise<void>) => {
  for (let i = from + 1; i <= text.length; i += 1) {
    set(text.slice(0, i));
    await wait(85);
  }
};

/** An unfinished address is typed and left, so the Field shows its error; finishing it clears the error. */
const story: Story<FieldScene> = async ({ state, scene, wait }) => {
  const full = "alex@example.com";
  await wait(700);
  await typed(full.slice(0, 5), 0, (email) => scene({ email }), wait);
  await wait(300);
  scene({ touched: true });
  state("error");
  await wait(1300);
  await typed(full, 5, (email) => scene({ email }), wait);
  await wait(300);
  state("success");
};

export default story;
