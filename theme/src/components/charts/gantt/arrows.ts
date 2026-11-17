import { BAR_H, DIAMOND } from "./layout";
import { roundedPath, type Row, type TaskRow } from "./model";

/** One finish-to-start dependency arrow: its path and arrow head. @internal */
export type GanttArrow = { key: string; from: string; to: string; d: string; head: string };

/** The geometry the dependency arrows are laid out on. @internal */
export type GanttArrowInput = {
  rows: Row[];
  byId: Map<string, TaskRow>;
  rowIndex: Map<string, number>;
  rowY: number[];
  rowH: number;
  rangeStart: number;
  px: number;
  rtl: boolean;
  contentW: number;
};

/**
 * Arrows: finish-to-start. They leave from under the end of the predecessor (so they never cross its
 * progress label) and enter the successor's start from the side.
 * @internal
 */
export function buildArrows(o: GanttArrowInput): GanttArrow[] {
  const { rows, byId, rowIndex, rowY, rowH, rangeStart, px, rtl, contentW } = o;
  const list: { key: string; from: string; to: string; d: string; head: string }[] = [];
  const at = (day: number) => (day - rangeStart) * px;
  const mirror = (o: number) => (rtl ? contentW - o : o);
  rows.forEach((row) => {
    if (row.kind !== "task") return;
    for (const depId of row.task.dependencies ?? []) {
      const from = byId.get(depId);
      if (!from || from.task.id === row.task.id) continue;
      const fi = rowIndex.get(from.key);
      const ti = rowIndex.get(row.key);
      if (fi === undefined || ti === undefined) continue; // one end is collapsed away
      const dir = ti > fi ? 1 : -1;
      const y1mid = (rowY[fi] ?? 0) + rowH / 2;
      const y2 = (rowY[ti] ?? 0) + rowH / 2;
      let x1: number;
      let y1: number;
      if (from.milestone) {
        x1 = at(from.start) + px / 2;
        y1 = y1mid + dir * (DIAMOND * 0.72);
      } else {
        const w = at(from.end) - at(from.start) - 2;
        x1 = at(from.start) + Math.max(2, w - Math.min(10, w / 3));
        y1 = y1mid + dir * (BAR_H / 2);
      }
      const x2 = row.milestone ? at(row.start) + px / 2 - DIAMOND * 0.72 - 1 : at(row.start) - 1;
      const g = 9;
      // Room to come straight down and turn in: an L. Otherwise step back along the gap between rows.
      const between = y1mid + dir * (rowH / 2);
      const pts: [number, number][] =
        x2 - x1 >= g
          ? [
              [x1, y1],
              [x1, y2],
              [x2, y2],
            ]
          : [
              [x1, y1],
              [x1, between],
              [x2 - g, between],
              [x2 - g, y2],
              [x2, y2],
            ];
      const tip = mirror(x2);
      const head = rtl ? -1 : 1;
      list.push({
        key: `${depId}\u0000${row.key}`,
        from: depId,
        to: row.task.id,
        d: roundedPath(pts.map(([x, y]) => [mirror(x), y] as [number, number])),
        head: `M${tip - head * 5},${y2 - 3.5}L${tip},${y2}L${tip - head * 5},${y2 + 3.5}`,
      });
    }
  });
  return list;
}
