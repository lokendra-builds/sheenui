import { Input } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { InputScene } from "./ShowcaseStage.input";

const valid = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/** The live Input on its stage: the error and the stage light follow what is typed. */
export function InputScene({ scene, ctx }: { scene: InputScene; ctx: StageContext }) {
  const [value, setValue] = useFollow(scene.value);
  const [touched, setTouched] = useFollow(scene.touched);
  const ok = valid(value);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        description="We only use it for receipts."
        autoComplete="off"
        value={value}
        error={touched && !ok ? "Enter a full address, like maya@example.com" : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          if (touched) ctx.setState(valid(event.target.value) ? "success" : "error");
        }}
        onBlur={() => {
          setTouched(true);
          ctx.setState(valid(value) ? "success" : "error");
        }}
        className="w-full text-start"
      />
    </div>
  );
}
