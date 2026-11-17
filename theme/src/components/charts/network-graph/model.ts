import { num, slotColor, type ChartColor, itemAt } from "../chart-utils";

/* ======================================================================
 * Data model
 * ====================================================================== */

/** A node of a NetworkGraph: an id, and optionally a label, a group and a size. */
export type NetworkNode = {
  id: string;
  /** Shown name. Default: the id. */
  label?: string;
  /** Id of the node's group (its colour). Nodes without a group share slot 1. */
  group?: string;
  /** Size of the node (its area). Optional. */
  value?: number;
};

/** A link of a NetworkGraph between two node ids, with an optional strength. */
export type NetworkLink = {
  source: string;
  target: string;
  /** Strength of the tie (the line's weight). Optional. */
  value?: number;
};

/**
 * A group of a NetworkGraph: an id, an optional label and an optional palette slot (the colour of its
 * nodes).
 */
export type NetworkGroup = {
  id: string;
  label?: string;
  /** Colour slot 1–8. Default: the group's position; past 8: neutral grey. */
  color?: ChartColor;
};

/** A laid-out node: its id, label, group, colour, value, radius and the indexes of its neighbours. */
export type GNode = {
  id: string;
  label: string;
  index: number;
  group: string | null;
  groupLabel: string | null;
  color: string;
  value: number | null;
  r: number;
  neighbours: number[];
};
/** A laid-out link between node indexes `s` and `t`, with its value and stroke width. */
export type GLink = { id: string; s: number; t: number; value: number; width: number };

/** Turns the nodes and links of the props into the node and link records of the layout (drops duplicate nodes, and links with an unknown end or to themselves). */
export function buildGraph(
  nodes: readonly NetworkNode[],
  links: readonly NetworkLink[],
  groups: readonly NetworkGroup[] | undefined,
) {
  const groupSlot = new Map<string, { slot: number; label: string }>();
  (groups ?? []).forEach((g, i) =>
    groupSlot.set(g.id, { slot: g.color ?? (i < 8 ? i + 1 : 0), label: g.label ?? g.id }),
  );
  const index = new Map<string, number>();
  const gnodes: GNode[] = [];
  const maxValue = Math.max(0, ...nodes.map((n) => Math.max(0, num(n.value))));
  for (const n of nodes) {
    if (index.has(n.id)) continue;
    if (n.group !== undefined && !groupSlot.has(n.group)) {
      const k = groupSlot.size;
      groupSlot.set(n.group, { slot: k < 8 ? k + 1 : 0, label: n.group });
    }
    const g = n.group !== undefined ? (groupSlot.get(n.group) ?? null) : null;
    const v = n.value === undefined ? null : Math.max(0, num(n.value));
    index.set(n.id, gnodes.length);
    gnodes.push({
      id: n.id,
      label: n.label ?? n.id,
      index: gnodes.length,
      group: n.group ?? null,
      groupLabel: g?.label ?? null,
      color: slotColor(g ? g.slot : 1),
      value: v,
      r: v !== null && maxValue > 0 ? 5 + Math.sqrt(v / maxValue) * 9 : 6,
      neighbours: [],
    });
  }
  const seen = new Map<string, GLink>();
  for (const l of links) {
    const s = index.get(l.source);
    const t = index.get(l.target);
    if (s === undefined || t === undefined || s === t) continue;
    const [a, b] = s < t ? [s, t] : [t, s];
    const id = `${a}-${b}`;
    const value = l.value === undefined ? 1 : Math.max(0, num(l.value));
    const prev = seen.get(id);
    if (prev) prev.value += value;
    else seen.set(id, { id, s: a, t: b, value, width: 1 });
  }
  const glinks = [...seen.values()];
  const maxLink = Math.max(0, ...glinks.map((l) => l.value));
  const weighted = links.some((l) => l.value !== undefined);
  for (const l of glinks) {
    l.width = weighted && maxLink > 0 ? 1 + 2.5 * Math.sqrt(l.value / maxLink) : 1.25;
    itemAt(gnodes, l.s).neighbours.push(l.t);
    itemAt(gnodes, l.t).neighbours.push(l.s);
  }
  return { nodes: gnodes, links: glinks, index, groups: groupSlot };
}

/** The graph as drawn: nodes and links by index, the id → index map and the groups' slots. */
export type Graph = ReturnType<typeof buildGraph>;

/**
 * The marks a frame rewrites: one path per colour holds every dot of that colour, one path per stroke width every
 * line of that width (a dozen paths whatever the size of the graph, so the browser restyles and re-lays-out a
 * handful of elements), plus the links by id for the reading's copies.
 */
export function batchMarks(graph: Graph) {
  const byColor = new Map<string, number[]>();
  for (const g of graph.nodes) {
    const list = byColor.get(g.color);
    if (list) list.push(g.index);
    else byColor.set(g.color, [g.index]);
  }
  const byWidth = new Map<number, GLink[]>();
  for (const l of graph.links) {
    const w = Math.round(l.width * 4) / 4;
    const list = byWidth.get(w);
    if (list) list.push(l);
    else byWidth.set(w, [l]);
  }
  return {
    nodes: [...byColor].map(([color, idx]) => ({ color, idx })),
    links: [...byWidth].map(([w, list]) => ({ w, list })),
    linkById: new Map(graph.links.map((l) => [l.id, l])),
  };
}
/** The drawing batches: nodes grouped by colour, links grouped by stroke width, and a lookup of links by id. */
export type Batches = ReturnType<typeof batchMarks>;

/** Entrance order: breadth first from the most connected node (then the next unvisited one), as a rank per node. */
export function entranceOrder(graph: Graph) {
  const n = graph.nodes.length;
  const order = new Array<number>(n).fill(-1);
  const byDegree = [...graph.nodes].sort((a, b) => b.neighbours.length - a.neighbours.length || a.index - b.index);
  let k = 0;
  for (const start of byDegree) {
    if (order[start.index] !== -1) continue;
    const queue = [start.index];
    order[start.index] = k++;
    while (queue.length > 0) {
      const i = queue.shift();
      if (i === undefined) break;
      for (const j of itemAt(graph.nodes, i).neighbours)
        if (order[j] === -1) {
          order[j] = k++;
          queue.push(j);
        }
    }
  }
  return order;
}
