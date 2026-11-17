import { useLayoutEffect, useRef } from "react";
import { describe, expect, it } from "vitest";

import { useRowWindow } from "../../src/components/data-table/row-window";
import { renderUi } from "../render";

const IDS = Array.from({ length: 10_000 }, (_, i) => `r${i}`);
/** Every 7th row wraps to two lines, so row heights differ from the first one measured. */
const heightOf = (i: number) => (i % 7 === 3 ? 88 : 44);

function Rows() {
  const scroller = useRef<HTMLDivElement>(null);
  const { window: win, report } = useRowWindow(scroller, IDS, true, 60);
  const start = win?.start ?? 0;
  const end = win?.end ?? IDS.length;
  return (
    <div ref={scroller} data-testid="scroller" style={{ height: 300, overflow: "auto" }}>
      <div style={{ height: win?.padTop ?? 0 }} />
      {IDS.slice(start, end).map((id, k) => (
        <Row key={id} id={id} height={heightOf(start + k)} report={report} />
      ))}
      <div style={{ height: win?.padBottom ?? 0 }} />
    </div>
  );
}

function Row({
  id,
  height,
  report,
}: {
  id: string;
  height: number;
  report: (id: string, part: "row" | "detail", height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    report(id, "row", ref.current!.getBoundingClientRect().height);
  });
  return <div ref={ref} style={{ height }} />;
}

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const tick = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => tick(left - 1)));
    tick(n);
  });

describe("useRowWindow", () => {
  it("keeps the total height stable while scrolling through 10,000 rows of uneven height", async () => {
    const { getByTestId } = renderUi(<Rows />);
    const el = getByTestId("scroller");
    await frames(6);
    const heights: number[] = [];
    // Jump down the list in big steps, as a dragged scrollbar does, then walk the last stretch.
    for (let step = 1; step <= 20; step += 1) {
      el.scrollTop = Math.round((el.scrollHeight / 20) * step) - 300;
      await frames(4);
      heights.push(el.scrollHeight);
    }
    await frames(6);
    heights.push(el.scrollHeight);
    // The real total is about 10,000 x 50.3 px. Before the fix the estimate was re-priced on every measurement and
    // the height moved by ~10,000 px between the start and the end of the list.
    const spread = Math.max(...heights) - Math.min(...heights);
    expect(spread).toBeLessThan(IDS.length * 3);
    // The estimate is locked to the first measured row (44 px), not re-priced: never a collapse towards zero.
    expect(Math.min(...heights)).toBeGreaterThan(IDS.length * 40);
  });
});
