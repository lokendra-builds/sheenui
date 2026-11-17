import { Toolbar, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";

import { I, icon } from "../pages/LayoutPages/shared";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ToolbarScene } from "./ShowcaseStage.toolbar";

/** The live Toolbar on its stage: one tab stop, the arrow keys move between the toggles. */
export function ToolbarScene({ scene }: { scene: ToolbarScene; ctx: StageContext }) {
  const [styles, setStyles] = useFollow(scene.styles);
  const on = styles ? styles.split(",") : [];
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Toolbar aria-label="Text formatting">
        <ToolbarToggleGroup
          multiple
          aria-label="Text style"
          value={on}
          onValueChange={(next) => setStyles(next.map(String).join(","))}
        >
          <ToolbarToggle value="bold" tooltip="Bold">
            {icon(I.bold)}
          </ToolbarToggle>
          <ToolbarToggle value="italic" tooltip="Italic">
            {icon(I.italic)}
          </ToolbarToggle>
          <ToolbarToggle value="underline" tooltip="Underline">
            {icon(I.underline)}
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>
      <p
        className="m-0 text-lg"
        style={{
          fontWeight: on.includes("bold") ? 700 : 400,
          fontStyle: on.includes("italic") ? "italic" : "normal",
          textDecoration: on.includes("underline") ? "underline" : "none",
        }}
      >
        Glass catches the light.
      </p>
    </div>
  );
}
