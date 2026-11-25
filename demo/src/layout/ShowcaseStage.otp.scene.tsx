import { useEffect, useRef } from "react";
import { OtpInput } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import { OTP_DEMO_CODE, type OtpScene } from "./ShowcaseStage.otp";

/** The live OTP input on its stage. The story drives it; once the person types, their input wins. */
export function OtpScene({ scene, ctx }: { scene: OtpScene; ctx: StageContext }) {
  const [value, setValue] = useFollow(scene.value);
  const [status, setStatus] = useFollow(scene.status);
  const timer = useRef<number | undefined>(undefined);
  const { setState } = ctx;
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title mb-4">Verify your number</p>
      <OtpInput
        length={OTP_DEMO_CODE.length}
        className="w-full max-w-[17rem] gap-6"
        aria-label="Verification code"
        value={value}
        status={status}
        successEffect="seal"
        successMessage="Your number is confirmed."
        onValueChange={(next) => {
          setValue(next);
          if (status !== "idle") {
            setStatus("idle");
            setState("idle");
          }
        }}
        onComplete={() => {
          setState("working");
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            setStatus("success");
            setState("success");
          }, 700);
        }}
        description="We sent a code to the phone ending in 47."
      />
    </div>
  );
}
