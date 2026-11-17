import type { Story, StageState } from "./ShowcaseStage";

/** The scene of a block stage: how far the block's story has got (0 is the resting block). */
export type BlockScene = { step: number };

/** One beat: wait this long, move to this step, and (optionally) colour the stage light. */
type Beat = readonly [wait: number, step: number, light?: StageState];

/** Plays the beats, then holds the last frame for `hold` ms so it can be read (a story runs 4 to 7 s in all). */
const seq =
  (beats: Beat[], hold = 1000): Story<BlockScene> =>
  async ({ state, scene, wait }) => {
    for (const [ms, step, light] of beats) {
      await wait(ms);
      scene({ step });
      if (light) state(light);
    }
    await wait(hold);
  };

/**
 * The block stories, one per kind of payoff. The step numbers match the `actions` list each page gives its BlockStage
 * (action `n` runs when the step reaches `n + 1`). Success is only ever lit where something succeeds.
 */
export const stories = {
  /** Fill, submit, a short wait, then the account opens. */
  submit: seq([
    [600, 1],
    [1100, 2],
    [800, 3, "working"],
    [1500, 4, "success"],
  ]),
  /** Three quick moves and a payoff. */
  three: seq([
    [800, 1],
    [1600, 2],
    [1700, 3, "success"],
  ]),
  /** A longer form: details in two steps, a press, a working wait, then it goes through. */
  pay: seq(
    [
      [700, 1],
      [1600, 2],
      [1600, 3, "working"],
      [1600, 4, "success"],
    ],
    800,
  ),
  /** A question, a send, a long answer. */
  chat: seq(
    [
      [700, 1],
      [1600, 2, "working"],
      [3300, 2, "idle"],
    ],
    700,
  ),
  /** Two moves, a lit end. */
  two: seq(
    [
      [1000, 1],
      [2000, 2, "lit"],
    ],
    1200,
  ),
  /** A tour: three moves. */
  tour: seq([
    [800, 1],
    [1500, 2],
    [1500, 3],
  ]),
  /** Four moves, the first working and a quiet finish. */
  work: seq(
    [
      [700, 1],
      [1200, 2, "working"],
      [1500, 3],
      [1500, 4, "idle"],
    ],
    800,
  ),
} satisfies Record<string, Story<BlockScene>>;

export type BlockStoryName = keyof typeof stories;
