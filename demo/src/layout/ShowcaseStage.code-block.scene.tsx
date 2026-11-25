import { CodeBlock } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { CodeBlockScene } from "./ShowcaseStage.code-block";

const BEFORE = `function total(items: Item[]) {
  return items.reduce((sum, i) => sum + i.price, 0);
}`;
const AFTER = `function total(items: Item[]) {
  return items.reduce((sum, i) => sum + i.price, 0);
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}`;

/** The live CodeBlock on its stage: line numbers, a marked line, a diff, copy. */
export function CodeBlockScene({ scene }: { scene: CodeBlockScene; ctx: StageContext }) {
  const fixed = scene.phase === 2;
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <CodeBlock
        key={fixed ? "after" : "before"}
        className="w-full text-start"
        filename="total.ts"
        language="ts"
        code={fixed ? AFTER : BEFORE}
        highlightLines={scene.phase === 1 ? "2" : undefined}
        removedLines={fixed ? "2" : undefined}
        addedLines={fixed ? "3" : undefined}
      />
    </div>
  );
}
