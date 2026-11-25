import { Button, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { InputGroupScene } from "./ShowcaseStage.input-group";

/** The live InputGroup on its stage: a prefix, the input and a button inside one glass edge. */
export function InputGroupScene({ scene, ctx }: { scene: InputGroupScene; ctx: StageContext }) {
  const [text, setText] = useFollow(scene.text);
  const [copied, setCopied] = useFollow(scene.copied);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Share your page</p>
      <InputGroup className="sheen-stage-wide">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Page address"
          placeholder="your.site/name"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setCopied(false);
          }}
        />
        <InputGroupAddon align="end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCopied(true);
              ctx.setState("success");
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <p className="sheen-stage-sub sheen-stage-slot">
        {copied ? "Link copied to the clipboard." : "Type an address, then copy it."}
      </p>
    </div>
  );
}
