import { Badge, ColorPicker } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import { COLOR_SWATCHES, type ColorPickerScene } from "./ShowcaseStage.color-picker";

/** The live ColorPicker on its stage, with a preview chip that follows the colour. */
export function ColorPickerScene({ scene, ctx }: { scene: ColorPickerScene; ctx: StageContext }) {
  const [color, setColor] = useFollow(scene.color);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Choose your accent</p>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <ColorPicker
          value={color}
          onValueChange={(next) => {
            setColor(next);
            ctx.setState("idle");
          }}
          swatches={COLOR_SWATCHES}
          // A definite width (not `w-full` of a shrink-to-fit row): the picker's area is size-contained, so a percentage
          // resolves to its 78 px content until the first layout settles and the whole stage then reflows (CLS).
          className="w-72 max-w-full"
          aria-label="Accent color"
        />
        <div className="flex flex-col items-center gap-3">
          <span
            aria-hidden
            className="size-20 rounded-sheen-xl shadow-[inset_0_0_0_1px_var(--sheen-border)] forced-color-adjust-none"
            style={{ backgroundColor: color }}
          />
          <Badge tone="neutral" className="font-sheen-mono">
            {color}
          </Badge>
        </div>
      </div>
    </div>
  );
}
