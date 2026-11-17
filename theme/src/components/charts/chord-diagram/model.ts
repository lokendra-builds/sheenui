import { type ReactNode } from "react";

import { type LegendItem } from "../chart-parts";
import { clamp, MAX_SERIES, num, slotColor, type ChartColor, type ChartInstructions, itemAt } from "../chart-utils";
import { mix, polar, r2, ringSector } from "../flow-utils";

/* ======================================================================
 * Layout (after d3-chord)
 * ====================================================================== */

/** A group of a ChordDiagram: an id, an optional label and an optional palette slot. */
export type ChordGroup = {
  id: string;
  /** Shown name. Default: the id. */
  label?: string;
  /** Colour slot 1–8. Default: the group's position. Past 8 groups the rest fold into "Other". */
  color?: ChartColor;
};

/** A group after small ones are folded into an other bucket. @internal */
export type Folded = { ids: string[]; label: string; slot: number; color: string; other: boolean };

/** Past 8 groups, groups 8+ fold into one neutral "Other" (rows and columns summed). */
export function fold(groups: readonly ChordGroup[], matrix: readonly (readonly number[])[], otherLabel: string) {
  const n = groups.length;
  const keep = n > MAX_SERIES ? MAX_SERIES - 1 : n;
  const out: Folded[] = groups.slice(0, keep).map((g, i) => {
    const slot = g.color ?? i + 1;
    return { ids: [g.id], label: g.label ?? g.id, slot, color: slotColor(slot), other: false };
  });
  if (n > keep)
    out.push({
      ids: groups.slice(keep).map((g) => g.id),
      label: otherLabel,
      slot: 0,
      color: slotColor(0),
      other: true,
    });
  const m = out.length;
  const where = (i: number) => Math.min(i, m - 1);
  const folded = Array.from({ length: m }, () => Array.from({ length: m }, () => 0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const v = Math.max(0, num(matrix[i]?.[j]));
      const row = folded[where(i)];
      const col = where(j);
      if (row) row[col] = (row[col] ?? 0) + v;
    }
  return { groups: out, matrix: folded };
}

/** One group's arc: its angles, value and in and out flow. @internal */
export type GroupArc = { index: number; a0: number; a1: number; value: number; outflow: number; inflow: number };
/** One ribbon between two groups, with its angles and values. @internal */
export type Ribbon = {
  id: string;
  /** Group indexes: i ≤ j. */
  i: number;
  j: number;
  /** Flow i → j (width at i) and j → i (width at j). */
  ij: number;
  ji: number;
  s0: number;
  s1: number;
  t0: number;
  t1: number;
};

/** Angles of every group and ribbon end (0 = 12 o'clock, clockwise), the first gap centred at the top. */
export function layoutChord(matrix: readonly (readonly number[])[], padAngle: number) {
  const n = matrix.length;
  const rows = matrix.map((row) => row.reduce((s, v) => s + v, 0));
  const total = rows.reduce((s, v) => s + v, 0);
  const live = rows.filter((v) => v > 0).length;
  const pad = live > 1 ? padAngle : 0;
  const k = total > 0 ? Math.max(0, Math.PI * 2 - pad * live) / total : 0;
  const groups: GroupArc[] = [];
  const sub: { a0: number; a1: number }[][] = [];
  let x = pad / 2;
  for (let i = 0; i < n; i++) {
    const a0 = x;
    sub[i] = [];
    for (let j = 0; j < n; j++) {
      const v = matrix[i]?.[j] ?? 0;
      itemAt(sub, i)[j] = { a0: x, a1: x + v * k };
      x += v * k;
    }
    groups.push({
      index: i,
      a0,
      a1: x,
      value: rows[i] ?? 0,
      outflow: rows[i] ?? 0,
      inflow: matrix.reduce((s, r) => s + (r[i] ?? 0), 0),
    });
    if ((rows[i] ?? 0) > 0) x += pad;
  }
  const ribbons: Ribbon[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const ij = matrix[i]?.[j] ?? 0;
      const ji = matrix[j]?.[i] ?? 0;
      if (ij <= 0 && ji <= 0) continue;
      const s = itemAt(itemAt(sub, i), j);
      const t = itemAt(itemAt(sub, j), i);
      ribbons.push({ id: `${i}-${j}`, i, j, ij, ji, s0: s.a0, s1: s.a1, t0: t.a0, t1: t.a1 });
    }
  return { groups, ribbons, total };
}

/** Formats a number to two decimals for path data. @internal */
export const f2 = (n: number) => n.toFixed(2);

/** A ribbon between two arcs of the inner circle (radius r), curving through the centre. */
export function ribbonPath(cx: number, cy: number, r: number, s0: number, s1: number, t0: number, t1: number) {
  const p = (a: number) => {
    const [x, y] = polar(cx, cy, r, a);
    return `${f2(x)},${f2(y)}`;
  };
  const arc = (a0: number, a1: number) => `A${f2(r)},${f2(r)} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
  const c = `${f2(cx)},${f2(cy)}`;
  let d = `M${p(s0)} ${arc(s0, s1)} Q${c} ${p(t0)}`;
  if (s0 !== t0 || s1 !== t1) d += ` ${arc(t0, t1)} Q${c} ${p(s0)}`;
  return `${d} Z`;
}

/* ======================================================================
 * Component
 * ====================================================================== */

/**
 * Every string ChordDiagram speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type ChordDiagramLabels = {
  roleDescription: string;
  instructions: ChartInstructions;
  hint: string;
  /** The group that folds in everything past 8 groups. */
  other: string;
  outflow: string;
  inflow: string;
  ofTotal: string;
  /** Title of a ribbon between two groups. */
  ribbonTitle: (a: string, b: string) => string;
  /** One direction of a ribbon. */
  direction: (from: string, to: string) => string;
  /** Announced after a group's values. */
  ribbonCount: (count: number) => string;
};

/**
 * The built-in English strings of ChordDiagram; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultChordDiagramLabels: ChordDiagramLabels = {
  roleDescription: "chord diagram",
  instructions:
    "Use the arrow keys to read it: left and right move around the groups, down steps through a group's ribbons, right and left on a ribbon jump between its two ends.",
  hint: "Tap a group or a ribbon to read it",
  other: "Other",
  outflow: "out",
  inflow: "in",
  ofTotal: "of all flow",
  ribbonTitle: (a, b) => `${a} and ${b}`,
  direction: (from, to) => `${from} → ${to}`,
  ribbonCount: (count) => `${count} ${count === 1 ? "ribbon" : "ribbons"}`,
};

/**
 * Props of ChordDiagram. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type ChordDiagramProps = {
  /** The groups around the circle, in order (≤ 8; the rest fold into "Other"). */
  groups: readonly ChordGroup[];
  /** matrix[i][j]: the flow from group i to group j (the ribbon's width at i). Missing and negative values read as 0. */
  matrix: readonly (readonly number[])[];
  /** Height in px; the circle fits the smaller of width and height. Default 360. */
  height?: number;
  /** Gap between groups, in radians. Default 0.04. */
  padAngle?: number;
  /** Print each group's name outside the ring where it fits; names that don't fit are listed in a legend under the circle. Default true. */
  showLabels?: boolean;
  /** Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown. Default compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the total for the tooltips and data table: takes the share, returns the text shown. Default percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Called with { id, label, outflow, inflow } when a group is clicked, tapped, or activated with Enter. Makes groups interactive. */
  onGroupClick?: (group: { id: string; label: string; outflow: number; inflow: number }) => void;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<ChordDiagramLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Legend items for a chord diagram (pass to ChartCard's `legend`, useful when names don't fit outside the ring).
 *
 * @see /charts/chord-diagram
 */
export function chordLegend(groups: readonly ChordGroup[], otherLabel = defaultChordDiagramLabels.other): LegendItem[] {
  const keep = groups.length > MAX_SERIES ? MAX_SERIES - 1 : groups.length;
  const items: LegendItem[] = groups
    .slice(0, keep)
    .map((g, i) => ({ label: g.label ?? g.id, color: slotColor(g.color ?? i + 1), kind: "rect" }));
  if (groups.length > keep) items.push({ label: otherLabel, color: slotColor(0), kind: "rect" });
  return items;
}

/** The hovered or focused part: a group or a ribbon. @internal */
export type Active = { kind: "group"; i: number } | { kind: "ribbon"; id: string; from: number };

/** Every angle on screen: group arcs by group index, ribbon ends by ribbon id. */
export type ChordAngles = {
  groups: Map<number, [number, number]>;
  ribbons: Map<string, [number, number, number, number]>;
};
/** The centre and radii of the chord layout. @internal */
export type ChordGeometry = { cx: number; cy: number; R: number; rIn: number; rRibbon: number };
/** The DOM elements of the drawn arcs, ribbons and gradients, kept for animation. @internal */
export type ChordMarks = {
  arcs: Map<string, SVGPathElement>;
  ribbons: Map<string, SVGPathElement>;
  gradients: Map<string, SVGLinearGradientElement>;
  names: Map<string, SVGTextElement>;
  ribbonLayer: SVGGElement | null;
  nameLayer: SVGGElement | null;
};

/** Extracts the group and ribbon angles of a layout so they can be morphed. @internal */
export function anglesOf(layout: ReturnType<typeof layoutChord>): ChordAngles {
  return {
    groups: new Map(layout.groups.map((g) => [g.index, [g.a0, g.a1]])),
    ribbons: new Map(layout.ribbons.map((r) => [r.id, [r.s0, r.s1, r.t0, r.t1]])),
  };
}

/** Angles part-way from `a` to `b` (new arcs and ribbons grow from the top: angle 0). */
export function mixAngles(a: ChordAngles | null, b: ChordAngles, t: number): ChordAngles {
  if (!a || t >= 1) return b;
  const groups = new Map<number, [number, number]>();
  for (const [k, v] of b.groups) {
    const f = a.groups.get(k) ?? [0, 0];
    groups.set(k, [mix(f[0], v[0], t), mix(f[1], v[1], t)]);
  }
  const ribbons = new Map<string, [number, number, number, number]>();
  for (const [k, v] of b.ribbons) {
    const f = a.ribbons.get(k) ?? [0, 0, 0, 0];
    ribbons.set(k, [mix(f[0], v[0], t), mix(f[1], v[1], t), mix(f[2], v[2], t), mix(f[3], v[3], t)]);
  }
  return { groups, ribbons };
}

/**
 * Writes every mark for one moment: the angles `a`, and the entrance progress `intro` (the ring
 * sweeps clockwise over the first 60%, then the ribbons bloom out of the centre).
 */
export function paintChord(marks: ChordMarks, a: ChordAngles, intro: number, g: ChordGeometry) {
  const sweep = clamp(intro / 0.6, 0, 1);
  const bloom = clamp((intro - 0.45) / 0.55, 0, 1);
  const cap = sweep * Math.PI * 2;
  for (const [id, el] of marks.arcs) {
    const v = a.groups.get(Number(id));
    const a1 = v ? Math.min(v[1], cap) : 0;
    el.setAttribute("d", v && a1 > v[0] ? ringSector(g.cx, g.cy, g.rIn, g.R, v[0], a1, 2) : "");
  }
  for (const [id, el] of marks.ribbons) {
    const v = a.ribbons.get(id);
    el.setAttribute("d", v ? ribbonPath(g.cx, g.cy, g.rRibbon, v[0], v[1], v[2], v[3]) : "");
  }
  for (const [id, el] of marks.gradients) {
    const v = a.ribbons.get(id);
    if (!v) continue;
    const [x1, y1] = polar(g.cx, g.cy, g.rRibbon, (v[0] + v[1]) / 2);
    const [x2, y2] = polar(g.cx, g.cy, g.rRibbon, (v[2] + v[3]) / 2);
    el.setAttribute("x1", f2(x1));
    el.setAttribute("y1", f2(y1));
    el.setAttribute("x2", f2(x2));
    el.setAttribute("y2", f2(y2));
  }
  for (const [id, el] of marks.names) {
    const v = a.groups.get(Number(id));
    if (!v) continue;
    const [x, y] = polar(g.cx, g.cy, g.R + 8, (v[0] + v[1]) / 2);
    el.setAttribute("x", f2(x));
    el.setAttribute("y", f2(y));
  }
  // Ribbons bloom out of the centre (transform + opacity only); names appear once the ring is round.
  const layer = marks.ribbonLayer;
  if (layer) {
    layer.style.opacity = bloom >= 1 ? "" : String(r2(bloom));
    layer.style.transform =
      bloom >= 1
        ? ""
        : `translate(${g.cx}px, ${g.cy}px) scale(${r2((0.86 + 0.14 * bloom) * 1000) / 1000}) translate(${-g.cx}px, ${-g.cy}px)`;
  }
  if (marks.nameLayer) marks.nameLayer.style.opacity = sweep >= 1 ? "" : "0";
}
