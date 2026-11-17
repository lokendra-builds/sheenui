import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { FieldScene } from "./ShowcaseStage.field";

/** The live Field on its stage: label, description and error wired to one Input. */
export function FieldScene({ scene, ctx }: { scene: FieldScene; ctx: StageContext }) {
  const [email, setEmail] = useFollow(scene.email);
  const [touched, setTouched] = useFollow(scene.touched);
  const invalid = touched && !/^\S+@\S+\.\S+$/.test(email);
  return (
    <div className="sheen-stage-col">
      <Field required invalid={invalid} className="sheen-stage-wide text-start">
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched) ctx.setState(/^\S+@\S+\.\S+$/.test(e.target.value) ? "success" : "error");
            }}
            onBlur={() => setTouched(true)}
          />
        </FieldControl>
        <FieldDescription>We only use it to send receipts.</FieldDescription>
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
    </div>
  );
}
