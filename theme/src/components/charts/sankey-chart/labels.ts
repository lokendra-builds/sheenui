import { type SankeyLayout, type SankeyLayoutNode } from "./layout";
import { LABEL_GAP, LABEL_SIZE, PAD_Y, VALUE_SIZE, type SankeyLabel } from "./paint";

/** The text measuring functions the label placement uses. @internal */
export type SankeyText = {
  width: (text: string, size: number, weight?: number) => number;
  fit: (text: string, room: number, size: number, weight?: number, min?: number) => string;
  wrap: (text: string, room: number, size: number, weight?: number) => string[] | null;
};

/** What the label placement depends on. @internal */
export type SankeyLabelInput = {
  layout: SankeyLayout;
  columns: SankeyLayoutNode[][];
  innerW: number;
  innerH: number;
  nodeWidth: number;
  outer: boolean;
  marginL: number;
  marginR: number;
  format: (v: number) => string;
  text: SankeyText;
};

/**
 * Labels beside each node, only where they fit: the biggest nodes claim their spot first, a label takes the
 * first of its layouts (name and value on one line, two lines, a shortened name...) that touches no other.
 * @internal
 */
export function placeSankeyLabels(o: SankeyLabelInput): SankeyLabel[] {
  const { layout, columns, innerW, innerH, nodeWidth, outer, marginL, marginR, format, text } = o;
  const placed: SankeyLabel[] = [];
  const C = columns.length;
  const gapAfter = C > 1 ? (innerW - nodeWidth) / (C - 1) - nodeWidth : innerW;
  // Every label's box so far: a new one may not touch any of them, in any column (the last
  // column's labels share their gap with the labels of the column before it).
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const clear = (b: { x0: number; x1: number; y0: number; y1: number }) =>
    b.y0 >= -PAD_Y &&
    b.y1 <= innerH + PAD_Y &&
    !boxes.some((o) => b.x0 < o.x1 + 6 && b.x1 > o.x0 - 6 && b.y0 < o.y1 + 2 && b.y1 > o.y0 - 2);
  // Biggest nodes claim their spot first, across the whole diagram.
  const byValue = [...layout.nodes].sort((a, b) => b.value - a.value || a.index - b.index);
  for (const n of byValue) {
    const c = n.column;
    const last = c === C - 1;
    // Wide: edge columns label outwards (into the margins), the rest to the right.
    // Narrow: every column labels to the right, except the last, which labels to the left.
    const side: "start" | "end" = outer ? (c === 0 ? "end" : "start") : last ? "end" : "start";
    // Inside the diagram a label keeps clearly closer to its own node than to the facing one.
    const room =
      outer && c === 0 ? marginL - LABEL_GAP : outer && last ? marginR - LABEL_GAP : gapAfter - LABEL_GAP - 14;
    const x = side === "start" ? n.x1 + LABEL_GAP : n.x0 - LABEL_GAP;
    const cy = (n.y0 + n.y1) / 2;
    const tall = n.y1 - n.y0 >= 28;
    const value = format(n.value);
    const valueW = text.width(value, VALUE_SIZE);
    const nameW = text.width(n.label, LABEL_SIZE, 500);
    const fits = nameW <= room;
    // A name too long for one line takes two (at a space) before it is ever shortened.
    const wrapped = fits ? null : text.wrap(n.label, room, LABEL_SIZE, 500);
    const wrappedW = wrapped ? Math.max(...wrapped.map((line) => text.width(line, LABEL_SIZE, 500))) : 0;
    const fitted = fits ? n.label : text.fit(n.label, room, LABEL_SIZE, 500, 4);
    const fittedW = fitted === n.label ? nameW : text.width(fitted, LABEL_SIZE, 500);
    // Preferred first: name and value on one line; the value on a line of its own; a two-line
    // name (with its value, then without); the name alone; a shortened name. The first that
    // fits and touches nothing wins.
    type Option = { name: string[]; value: string; inline: boolean; w: number; half: number };
    const options: Option[] = [];
    if (fits && nameW + 6 + valueW <= room)
      options.push({ name: [n.label], value, inline: true, w: nameW + 6 + valueW, half: 8 });
    if (fits && tall && valueW <= room)
      options.push({ name: [n.label], value, inline: false, w: Math.max(nameW, valueW), half: 15 });
    if (wrapped?.length === 2 && valueW <= room && n.y1 - n.y0 >= 36)
      options.push({ name: wrapped, value, inline: false, w: Math.max(wrappedW, valueW), half: 22 });
    if (wrapped?.length === 2) options.push({ name: wrapped, value: "", inline: false, w: wrappedW, half: 15 });
    if (fitted && tall && valueW <= room)
      options.push({ name: [fitted], value, inline: false, w: Math.max(fittedW, valueW), half: 15 });
    if (fitted) options.push({ name: [fitted], value: "", inline: false, w: fittedW, half: 8 });
    for (const o of options) {
      const box = {
        x0: side === "start" ? x : x - o.w,
        x1: side === "start" ? x + o.w : x,
        y0: cy - o.half,
        y1: cy + o.half,
      };
      if (!clear(box)) continue;
      boxes.push(box);
      placed.push({ id: n.id, x, y: cy, anchor: side, name: o.name, value: o.value, inline: o.inline, column: c });
      break;
    }
  }
  return placed;
}
