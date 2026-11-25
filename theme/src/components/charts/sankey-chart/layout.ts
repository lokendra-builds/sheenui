import { num, slotColor, type ChartColor, itemAt } from "../chart-utils";
import { r2 } from "../flow-utils";

/* ======================================================================
 * Sankey layout (after d3-sankey: columns, then iterative relaxation)
 * ====================================================================== */

/** A node of a SankeyChart: an id, and optionally a label and a palette slot. */
export type SankeyNode = {
  id: string;
  /** Shown name. Default: the id. */
  label?: string;
  /**
   * Colour slot 1–8. Default: the node's position (nodes first, then any only named by a link);
   * past slot 8 a node takes the colour of its largest inflow, else neutral grey.
   */
  color?: ChartColor;
  /**
   * A status colour instead of a palette slot: "success" (a good outcome: hired, retained) or "danger" (a bad one:
   * left, cost). It uses the theme's success / danger tones, so the status colours stay in the palette's own
   * family instead of a pure green or red, and wins over `color`.
   */
  tone?: "success" | "danger";
};

/** The node fill of a status tone: deep enough in light, light enough in dark, to hold 3:1 against the chart surface. */
export const TONE_FILL = {
  success: "light-dark(var(--sheen-green-700), var(--sheen-green-400))",
  danger: "light-dark(var(--sheen-rose-700), var(--sheen-rose-400))",
} as const;

/** A flow of a SankeyChart from one node id to another, with its size. */
export type SankeyLink = {
  source: string;
  target: string;
  /** Size of the flow. Zero, negative and non-finite values are left out. */
  value: number;
};

/** How a SankeyChart places nodes across its columns: `justify`, `left`, `right` or `center`. */
export type SankeyAlign = "justify" | "left" | "right" | "center";

/**
 * A link after layout: its source and target nodes, its value, its thickness (`width`) and its
 * vertical ends in px.
 */
export type SankeyLayoutLink = {
  id: string;
  index: number;
  source: SankeyLayoutNode;
  target: SankeyLayoutNode;
  value: number;
  /** Thickness in px. */
  width: number;
  /** Centre of the ribbon where it leaves the source / enters the target. */
  y0: number;
  y1: number;
};

/**
 * A node after layout: its column, colour, inflow and outflow, its box in px and the links that enter
 * and leave it.
 */
export type SankeyLayoutNode = {
  id: string;
  label: string;
  /** Palette slot (0 = neutral). */
  slot: number;
  color: string;
  index: number;
  column: number;
  /** max(inflow, outflow). */
  value: number;
  inflow: number;
  outflow: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  sourceLinks: SankeyLayoutLink[];
  targetLinks: SankeyLayoutLink[];
};

/**
 * The result of laying out a Sankey: positioned nodes and links, the number of columns and the total
 * flow.
 */
export type SankeyLayout = {
  nodes: SankeyLayoutNode[];
  links: SankeyLayoutLink[];
  columns: number;
  /** Sum of every source node's outflow: the whole flow. */
  total: number;
};

/** Options of the Sankey layout: size, node width and padding, alignment and iteration count. */
export type SankeyLayoutOptions = {
  width: number;
  height: number;
  nodeWidth?: number;
  /** Smallest vertical gap between two nodes of a column (shrinks when a column is crowded). */
  nodePadding?: number;
  align?: SankeyAlign;
  /** Relaxation passes. Default 8. */
  iterations?: number;
};

/** Orders nodes by top edge, then by index. @internal */
export const byY = (a: SankeyLayoutNode, b: SankeyLayoutNode) => a.y0 - b.y0 || a.index - b.index;
const bySourceY = (a: SankeyLayoutLink, b: SankeyLayoutLink) => byY(a.source, b.source) || a.index - b.index;
const byTargetY = (a: SankeyLayoutLink, b: SankeyLayoutLink) => byY(a.target, b.target) || a.index - b.index;

/**
 * Lays out a sankey diagram in a `width` × `height` box: nodes in columns by their longest path
 * from a source, sized by their flow, then nudged up and down over a few passes so ribbons run as
 * straight as possible without nodes overlapping. Links that would close a cycle, self-links and
 * non-positive values are left out; repeated source → target pairs are summed.
 *
 * @see /charts/sankey-diagram
 */
export function layoutSankey(
  nodesIn: readonly SankeyNode[] | undefined,
  linksIn: readonly SankeyLink[],
  { width, height, nodeWidth = 12, nodePadding = 16, align = "justify", iterations = 8 }: SankeyLayoutOptions,
): SankeyLayout {
  const byId = new Map<string, SankeyLayoutNode>();
  const specs = new Map<string, SankeyNode>();
  for (const n of nodesIn ?? []) if (!specs.has(n.id)) specs.set(n.id, n);
  let order = 0;
  const node = (id: string) => {
    let n = byId.get(id);
    if (!n) {
      const spec = specs.get(id);
      n = {
        id,
        label: spec?.label ?? id,
        slot: 0,
        color: "",
        index: -1,
        column: 0,
        value: 0,
        inflow: 0,
        outflow: 0,
        x0: 0,
        x1: 0,
        y0: 0,
        y1: 0,
        sourceLinks: [],
        targetLinks: [],
      };
      byId.set(id, n);
    }
    return n;
  };
  // Indexes follow the `nodes` order first, then first mention in a link.
  const position = new Map<string, number>();
  for (const id of specs.keys()) position.set(id, order++);
  for (const l of linksIn) {
    if (!position.has(l.source)) position.set(l.source, order++);
    if (!position.has(l.target)) position.set(l.target, order++);
  }

  // Sum repeated pairs; drop self-links and non-positive values.
  const pairs = new Map<string, { source: string; target: string; value: number }>();
  for (const l of linksIn) {
    const value = num(l.value);
    if (!(value > 0) || l.source === l.target) continue;
    const key = `${l.source}\u0000${l.target}`;
    const prev = pairs.get(key);
    if (prev) prev.value += value;
    else pairs.set(key, { source: l.source, target: l.target, value });
  }

  // Drop links that would close a cycle (back edges of a depth-first walk in input order).
  const out = new Map<string, string[]>();
  for (const p of pairs.values()) out.set(p.source, [...(out.get(p.source) ?? []), p.target]);
  const state = new Map<string, 1 | 2>();
  const back = new Set<string>();
  const ids = [...position.keys()];
  for (const start of ids) {
    if (state.has(start)) continue;
    const stack: [string, number][] = [[start, 0]];
    state.set(start, 1);
    while (stack.length > 0) {
      const top = itemAt(stack, stack.length - 1);
      const nexts = out.get(top[0]) ?? [];
      if (top[1] >= nexts.length) {
        state.set(top[0], 2);
        stack.pop();
        continue;
      }
      const next = nexts[top[1]++] ?? "";
      const s = state.get(next);
      if (s === 1) back.add(`${top[0]}\u0000${next}`);
      else if (s === undefined) {
        state.set(next, 1);
        stack.push([next, 0]);
      }
    }
  }

  const links: SankeyLayoutLink[] = [];
  for (const [key, p] of pairs) {
    if (back.has(key)) continue;
    const s = node(p.source);
    const t = node(p.target);
    const link: SankeyLayoutLink = {
      id: key,
      index: links.length,
      source: s,
      target: t,
      value: p.value,
      width: 0,
      y0: 0,
      y1: 0,
    };
    s.sourceLinks.push(link);
    t.targetLinks.push(link);
    links.push(link);
  }
  const nodes = [...byId.values()].sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));
  nodes.forEach((n, i) => {
    n.index = i;
    n.inflow = n.targetLinks.reduce((s, l) => s + l.value, 0);
    n.outflow = n.sourceLinks.reduce((s, l) => s + l.value, 0);
    n.value = Math.max(n.inflow, n.outflow);
  });
  if (nodes.length === 0) return { nodes, links, columns: 0, total: 0 };

  // Topological order (Kahn), longest path from the sources (depth) and to the sinks (height).
  const indeg = new Map(nodes.map((n) => [n, n.targetLinks.length]));
  const queue = nodes.filter((n) => n.targetLinks.length === 0);
  const topo: SankeyLayoutNode[] = [];
  while (queue.length > 0) {
    const n = queue.shift();
    if (!n) break;
    topo.push(n);
    for (const l of n.sourceLinks) {
      const d = (indeg.get(l.target) ?? 1) - 1;
      indeg.set(l.target, d);
      if (d === 0) queue.push(l.target);
    }
  }
  const depth = new Map<SankeyLayoutNode, number>();
  for (const n of topo)
    depth.set(
      n,
      n.targetLinks.reduce((m, l) => Math.max(m, (depth.get(l.source) ?? 0) + 1), 0),
    );
  const tall = new Map<SankeyLayoutNode, number>();
  for (const n of [...topo].reverse())
    tall.set(
      n,
      n.sourceLinks.reduce((m, l) => Math.max(m, (tall.get(l.target) ?? 0) + 1), 0),
    );
  const maxDepth = Math.max(0, ...depth.values());
  for (const n of nodes) {
    const d = depth.get(n) ?? 0;
    if (align === "left") n.column = d;
    else if (align === "right") n.column = maxDepth - (tall.get(n) ?? 0);
    else if (align === "center")
      n.column =
        n.targetLinks.length > 0
          ? d
          : n.sourceLinks.length > 0
            ? Math.min(...n.sourceLinks.map((l) => depth.get(l.target) ?? 1)) - 1
            : 0;
    else n.column = n.sourceLinks.length > 0 ? d : maxDepth;
  }

  // Colours: own slot, else position (1–8), else the colour of the largest inflow, else neutral.
  for (const n of topo) {
    const spec = specs.get(n.id);
    if (spec?.color !== undefined) n.slot = spec.color;
    else if (n.index < 8) n.slot = n.index + 1;
    else {
      const main = n.targetLinks.reduce<SankeyLayoutLink | null>((m, l) => (!m || l.value > m.value ? l : m), null);
      n.slot = main?.source.slot ?? 0;
    }
    n.color = spec?.tone ? TONE_FILL[spec.tone] : slotColor(n.slot);
  }

  // Columns and horizontal positions.
  const columnCount = Math.max(...nodes.map((n) => n.column)) + 1;
  const columns: SankeyLayoutNode[][] = Array.from({ length: columnCount }, () => []);
  for (const n of nodes) itemAt(columns, n.column).push(n);
  const kx = columnCount > 1 ? (width - nodeWidth) / (columnCount - 1) : 0;
  for (const n of nodes) {
    n.x0 = columnCount > 1 ? n.column * kx : (width - nodeWidth) / 2;
    n.x1 = n.x0 + nodeWidth;
  }

  // Vertical scale: the most crowded column decides it; padding gives way before the bars do.
  const maxLen = Math.max(...columns.map((c) => c.length));
  const py = Math.max(2, Math.min(nodePadding, maxLen > 1 ? (height * 0.45) / (maxLen - 1) : nodePadding));
  const ky = Math.min(
    ...columns.map((c) => {
      const sum = c.reduce((s, n) => s + n.value, 0);
      return sum > 0 ? (height - (c.length - 1) * py) / sum : Infinity;
    }),
  );
  const k = Number.isFinite(ky) ? Math.max(0, ky) : 0;
  for (const l of links) l.width = l.value * k;
  for (const c of columns) {
    let y = 0;
    for (const n of c) {
      n.y0 = y;
      n.y1 = y + n.value * k;
      y = n.y1 + py;
    }
    // Share the free space between the nodes, so the column starts out centred.
    const free = (height - y + py) / (c.length + 1);
    c.forEach((n, i) => {
      n.y0 += free * (i + 1);
      n.y1 += free * (i + 1);
    });
    for (const n of c) {
      n.sourceLinks.sort(byTargetY);
      n.targetLinks.sort(bySourceY);
    }
  }

  const reorderNodeLinks = (n: SankeyLayoutNode) => {
    for (const { source } of n.targetLinks) source.sourceLinks.sort(byTargetY);
    for (const { target } of n.sourceLinks) target.targetLinks.sort(bySourceY);
  };
  // The y0 a target would need for the link from `source` to run straight (and vice versa).
  const targetTop = (source: SankeyLayoutNode, target: SankeyLayoutNode) => {
    let y = source.y0 - ((source.sourceLinks.length - 1) * py) / 2;
    for (const l of source.sourceLinks) {
      if (l.target === target) break;
      y += l.width + py;
    }
    for (const l of target.targetLinks) {
      if (l.source === source) break;
      y -= l.width;
    }
    return y;
  };
  const sourceTop = (source: SankeyLayoutNode, target: SankeyLayoutNode) => {
    let y = target.y0 - ((target.targetLinks.length - 1) * py) / 2;
    for (const l of target.targetLinks) {
      if (l.source === source) break;
      y += l.width + py;
    }
    for (const l of source.sourceLinks) {
      if (l.target === target) break;
      y -= l.width;
    }
    return y;
  };
  const shift = (n: SankeyLayoutNode, dy: number) => {
    n.y0 += dy;
    n.y1 += dy;
  };
  const pushDown = (c: SankeyLayoutNode[], y: number, i: number, alpha: number) => {
    for (; i < c.length; i++) {
      const n = itemAt(c, i);
      const dy = (y - n.y0) * alpha;
      if (dy > 1e-6) shift(n, dy);
      y = n.y1 + py;
    }
  };
  const pushUp = (c: SankeyLayoutNode[], y: number, i: number, alpha: number) => {
    for (; i >= 0; i--) {
      const n = itemAt(c, i);
      const dy = (n.y1 - y) * alpha;
      if (dy > 1e-6) shift(n, -dy);
      y = n.y0 - py;
    }
  };
  const resolveCollisions = (c: SankeyLayoutNode[], alpha: number) => {
    const i = c.length >> 1;
    const subject = c[i];
    if (!subject) return;
    pushUp(c, subject.y0 - py, i - 1, alpha);
    pushDown(c, subject.y1 + py, i + 1, alpha);
    pushUp(c, height, c.length - 1, alpha);
    pushDown(c, 0, 0, alpha);
  };
  for (let it = 0; it < iterations; it++) {
    const alpha = 0.99 ** it;
    const beta = Math.max(1 - alpha, (it + 1) / iterations);
    for (let ci = columnCount - 2; ci >= 0; ci--) {
      const c = itemAt(columns, ci);
      for (const source of c) {
        let y = 0;
        let w = 0;
        for (const l of source.sourceLinks) {
          const v = l.value * (l.target.column - source.column);
          y += sourceTop(source, l.target) * v;
          w += v;
        }
        if (w > 0) {
          shift(source, (y / w - source.y0) * alpha);
          reorderNodeLinks(source);
        }
      }
      c.sort(byY);
      resolveCollisions(c, beta);
    }
    for (let ci = 1; ci < columnCount; ci++) {
      const c = itemAt(columns, ci);
      for (const target of c) {
        let y = 0;
        let w = 0;
        for (const l of target.targetLinks) {
          const v = l.value * (target.column - l.source.column);
          y += targetTop(l.source, target) * v;
          w += v;
        }
        if (w > 0) {
          shift(target, (y / w - target.y0) * alpha);
          reorderNodeLinks(target);
        }
      }
      c.sort(byY);
      resolveCollisions(c, beta);
    }
  }

  for (const n of nodes) {
    let y0 = n.y0;
    let y1 = n.y0;
    for (const l of n.sourceLinks) {
      l.y0 = y0 + l.width / 2;
      y0 += l.width;
    }
    for (const l of n.targetLinks) {
      l.y1 = y1 + l.width / 2;
      y1 += l.width;
    }
  }
  const total = nodes.filter((n) => n.targetLinks.length === 0).reduce((s, n) => s + n.outflow, 0);
  return { nodes, links, columns: columnCount, total };
}

/** The ribbon of a link: a horizontal S-curve from the source's right edge to the target's left edge.
 *
 * @see /charts/sankey-diagram
 */
export function sankeyLinkPath(link: SankeyLayoutLink, gap = 2) {
  const x0 = link.source.x1 + gap;
  const x1 = link.target.x0 - gap;
  const xm = (x0 + x1) / 2;
  return `M${r2(x0)},${r2(link.y0)} C${r2(xm)},${r2(link.y0)} ${r2(xm)},${r2(link.y1)} ${r2(x1)},${r2(link.y1)}`;
}
