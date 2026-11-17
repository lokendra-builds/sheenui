import type { Story } from "./ShowcaseStage";

/** The OTP stage's scene: the digits typed so far and the field's status. */
export type OtpScene = { value: string; status: "idle" | "success" };

/** The code the story types. */
export const OTP_DEMO_CODE = "428913";

/** Six digits are typed, a light scans while the code is checked, then the cells fold into the glass seal. */
const story: Story<OtpScene> = async ({ state, scene, wait }) => {
  await wait(600);
  for (let i = 1; i <= OTP_DEMO_CODE.length; i += 1) {
    scene({ value: OTP_DEMO_CODE.slice(0, i) });
    await wait(190);
  }
  state("working");
  await wait(700);
  scene({ status: "success" });
  state("success");
};

export default story;
