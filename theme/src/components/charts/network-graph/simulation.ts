/* ======================================================================
 * Force simulation (velocity Verlet, after d3-force): link springs,
 * many-body charge, centring, weak gravity and collision.
 * ====================================================================== */

/**
 * Tuning of the force layout: link length, charge, collision padding, number of ticks, gravity, aspect
 * and the approximation `theta`.
 */
export type ForceSimulationOptions = {
  /** Rest length of a link. Default 38. */
  linkDistance?: number;
  /** Many-body strength: negative repels. Default −110. */
  charge?: number;
  /** Extra space kept between node circles. Default 4. */
  collidePadding?: number;
  /** Ticks for a full cool-down from alpha 1. Default 300. */
  ticks?: number;
  /** Pull towards the centre that keeps unlinked parts close. Default 0.06. */
  gravity?: number;
  /**
   * Width ÷ height of the box the layout will be shown in. Gravity pulls harder across the short
   * side, so a wide card gets a wide layout instead of a small round one. Default 1.
   */
  aspect?: number;
  /**
   * Barnes–Hut accuracy for big graphs (more than 100 nodes): far-away groups of nodes repel as
   * one. Smaller is more exact and slower. Default 0.9 (as d3). Small graphs are always exact.
   */
  theta?: number;
};

/**
 * A running force layout: node positions (`x`, `y`), pinned positions, its energy (`alpha`) and `tick`
 * to advance it.
 */
export type ForceSimulation = {
  readonly x: Float64Array;
  readonly y: Float64Array;
  /** Pinned positions (null = free), e.g. while a node is dragged. */
  fx: (number | null)[];
  fy: (number | null)[];
  alpha: number;
  alphaTarget: number;
  readonly alphaMin: number;
  tick: () => void;
  /** Flat [x0, y0, x1, y1, ...] copy of the positions. */
  positions: () => number[];
};

/** A tiny deterministic nudge for coincident points (d3 uses Math.random; layouts here must repeat exactly). */
export const jiggle = (i: number, j: number) => (((i * 7919 + j * 104_729) % 1000) / 1000 - 0.5) * 1e-6;

/** Above this many nodes, charge uses a Barnes–Hut quadtree and collision a grid (O(n log n), not O(n²)). */
export const EXACT_UP_TO = 100;

/** A cell of the Barnes–Hut quadtree: its square, the centre and mass of its points, and its children. */
export type Quad = {
  x0: number;
  y0: number;
  s: number;
  cx: number;
  cy: number;
  m: number;
  kids: (Quad | null)[] | null;
  pts: number[];
};

/** Creates an empty quadtree cell at `(x0, y0)` with side `s`. */
export const quad = (x0: number, y0: number, s: number): Quad => ({
  x0,
  y0,
  s,
  cx: 0,
  cy: 0,
  m: 0,
  kids: null,
  pts: [],
});

/** Adds point `i` to a cell, splitting the cell when it already holds one. */
export function quadInsert(q: Quad, i: number, depth: number, x: Float64Array, y: Float64Array) {
  if (!q.kids) {
    // A leaf keeps one point (or several that sit on top of each other, past depth 20).
    if (q.pts.length === 0 || depth >= 20) {
      q.pts.push(i);
      return;
    }
    const old = q.pts;
    q.pts = [];
    q.kids = [null, null, null, null];
    for (const j of old) quadChild(q, j, depth, x, y);
  }
  quadChild(q, i, depth, x, y);
}

/** Hands point `i` to the child cell of `q` that contains it, creating the cell when needed. */
export function quadChild(q: Quad, i: number, depth: number, x: Float64Array, y: Float64Array) {
  const h = q.s / 2;
  const right = (x[i] ?? 0) >= q.x0 + h ? 1 : 0;
  const down = (y[i] ?? 0) >= q.y0 + h ? 1 : 0;
  const k = down * 2 + right;
  const kids = (q.kids ??= [null, null, null, null]);
  const c = (kids[k] ??= quad(q.x0 + right * h, q.y0 + down * h, h));
  quadInsert(c, i, depth + 1, x, y);
}

/** Computes the mass and centre of mass of every cell, bottom up. */
export function quadSum(q: Quad, x: Float64Array, y: Float64Array) {
  let m = 0;
  let sx = 0;
  let sy = 0;
  if (q.kids) {
    for (const c of q.kids) {
      if (!c) continue;
      quadSum(c, x, y);
      m += c.m;
      sx += c.cx * c.m;
      sy += c.cy * c.m;
    }
  } else {
    for (const j of q.pts) {
      m += 1;
      sx += x[j] ?? 0;
      sy += y[j] ?? 0;
    }
  }
  q.m = m;
  q.cx = m > 0 ? sx / m : 0;
  q.cy = m > 0 ? sy / m : 0;
}

/** Charge on node i from everything in quad q: far groups act as one body at their centre. */
export function quadRepel(
  q: Quad,
  i: number,
  k: number,
  theta2: number,
  x: Float64Array,
  y: Float64Array,
  vx: Float64Array,
  vy: Float64Array,
) {
  if (q.m === 0) return;
  if (q.kids) {
    const dx = q.cx - (x[i] ?? 0);
    const dy = q.cy - (y[i] ?? 0);
    let l2 = dx * dx + dy * dy;
    if ((q.s * q.s) / theta2 < l2) {
      if (l2 < 1) l2 = Math.sqrt(l2);
      const w = (k * q.m) / l2;
      vx[i] = (vx[i] ?? 0) + dx * w;
      vy[i] = (vy[i] ?? 0) + dy * w;
      return;
    }
    for (const c of q.kids) if (c) quadRepel(c, i, k, theta2, x, y, vx, vy);
    return;
  }
  for (const j of q.pts) {
    if (j === i) continue;
    let dx = (x[j] ?? 0) - (x[i] ?? 0);
    let dy = (y[j] ?? 0) - (y[i] ?? 0);
    let l2 = dx * dx + dy * dy;
    if (l2 === 0) {
      dx = jiggle(i, j);
      dy = jiggle(j, i);
      l2 = dx * dx + dy * dy;
    }
    if (l2 < 1) l2 = Math.sqrt(l2);
    const w = k / l2;
    vx[i] = (vx[i] ?? 0) + dx * w;
    vy[i] = (vy[i] ?? 0) + dy * w;
  }
}

/**
 * Builds a force simulation over `count` nodes of radius `radii`, linked by `links` (indexes).
 * Starting positions default to a phyllotaxis spiral, so the same graph always lays out the same.
 */
export function createForceSimulation(
  radii: readonly number[],
  links: readonly { source: number; target: number }[],
  init: readonly ({ x: number; y: number } | null)[] | null,
  {
    linkDistance = 38,
    charge = -110,
    collidePadding = 4,
    ticks = 300,
    gravity = 0.06,
    aspect = 1,
    theta = 0.9,
  }: ForceSimulationOptions = {},
): ForceSimulation {
  const n = radii.length;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const vx = new Float64Array(n);
  const vy = new Float64Array(n);
  const r = Float64Array.from(radii);
  const maxR = r.reduce((m, v) => Math.max(m, v), 0);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const p = init?.[i];
    if (p) {
      x[i] = p.x;
      y[i] = p.y;
    } else {
      const rad = 10 * Math.sqrt(0.5 + i);
      x[i] = rad * Math.cos(i * golden);
      y[i] = rad * Math.sin(i * golden);
    }
  }
  const degree = new Array<number>(n).fill(0);
  for (const l of links) {
    degree[l.source] = (degree[l.source] ?? 0) + 1;
    degree[l.target] = (degree[l.target] ?? 0) + 1;
  }
  const springs = links.map((l) => {
    const ds = degree[l.source] ?? 1;
    const dt = degree[l.target] ?? 1;
    return {
      s: l.source,
      t: l.target,
      strength: 1 / Math.max(1, Math.min(ds, dt)),
      bias: ds / Math.max(1, ds + dt),
      distance: linkDistance + (r[l.source] ?? 0) + (r[l.target] ?? 0),
    };
  });
  const stretch = Math.sqrt(Math.min(4, Math.max(0.25, aspect)));
  const gx = gravity / stretch;
  const gy = gravity * stretch;
  const alphaMin = 0.001;
  const alphaDecay = 1 - alphaMin ** (1 / Math.max(1, ticks));
  const velocityDecay = 0.4;
  const theta2 = Math.max(0.01, theta * theta);
  const exact = n <= EXACT_UP_TO;

  const collide = (i: number, j: number) => {
    let dx = (x[i] ?? 0) + (vx[i] ?? 0) - (x[j] ?? 0) - (vx[j] ?? 0);
    let dy = (y[i] ?? 0) + (vy[i] ?? 0) - (y[j] ?? 0) - (vy[j] ?? 0);
    const rr = (r[i] ?? 0) + (r[j] ?? 0) + collidePadding;
    let l2 = dx * dx + dy * dy;
    if (l2 >= rr * rr) return;
    if (l2 === 0) {
      dx = jiggle(i, j);
      dy = jiggle(j, i);
      l2 = dx * dx + dy * dy;
    }
    const l = Math.sqrt(l2);
    const k = ((rr - l) / l) * 0.7;
    dx *= k;
    dy *= k;
    const ri2 = (r[i] ?? 0) * (r[i] ?? 0);
    const rj2 = (r[j] ?? 0) * (r[j] ?? 0);
    const wi = rj2 / Math.max(1e-9, ri2 + rj2);
    vx[i] = (vx[i] ?? 0) + dx * wi;
    vy[i] = (vy[i] ?? 0) + dy * wi;
    vx[j] = (vx[j] ?? 0) - dx * (1 - wi);
    vy[j] = (vy[j] ?? 0) - dy * (1 - wi);
  };

  const sim: ForceSimulation = {
    x,
    y,
    fx: new Array<number | null>(n).fill(null),
    fy: new Array<number | null>(n).fill(null),
    alpha: 1,
    alphaTarget: 0,
    alphaMin,
    positions: () => {
      const out = new Array<number>(n * 2);
      for (let i = 0; i < n; i++) {
        out[i * 2] = x[i] ?? 0;
        out[i * 2 + 1] = y[i] ?? 0;
      }
      return out;
    },
    tick: () => {
      sim.alpha += (sim.alphaTarget - sim.alpha) * alphaDecay;
      const a = sim.alpha;
      // Links: springs towards their rest length, the lighter end moving more.
      for (const l of springs) {
        let dx = (x[l.t] ?? 0) + (vx[l.t] ?? 0) - (x[l.s] ?? 0) - (vx[l.s] ?? 0);
        let dy = (y[l.t] ?? 0) + (vy[l.t] ?? 0) - (y[l.s] ?? 0) - (vy[l.s] ?? 0);
        if (dx === 0) dx = jiggle(l.s, l.t);
        if (dy === 0) dy = jiggle(l.t, l.s);
        const len = Math.sqrt(dx * dx + dy * dy);
        const k = ((len - l.distance) / len) * a * l.strength;
        dx *= k;
        dy *= k;
        vx[l.t] = (vx[l.t] ?? 0) - dx * l.bias;
        vy[l.t] = (vy[l.t] ?? 0) - dy * l.bias;
        vx[l.s] = (vx[l.s] ?? 0) + dx * (1 - l.bias);
        vy[l.s] = (vy[l.s] ?? 0) + dy * (1 - l.bias);
      }
      // Charge: the exact pairwise sum for small graphs, Barnes–Hut for big ones.
      if (exact) {
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            let dx = (x[j] ?? 0) - (x[i] ?? 0);
            let dy = (y[j] ?? 0) - (y[i] ?? 0);
            let l2 = dx * dx + dy * dy;
            if (l2 === 0) {
              dx = jiggle(i, j);
              dy = jiggle(j, i);
              l2 = dx * dx + dy * dy;
            }
            if (l2 < 1) l2 = Math.sqrt(l2);
            const w = (charge * a) / l2;
            vx[i] = (vx[i] ?? 0) + dx * w;
            vy[i] = (vy[i] ?? 0) + dy * w;
            vx[j] = (vx[j] ?? 0) - dx * w;
            vy[j] = (vy[j] ?? 0) - dy * w;
          }
        }
      } else if (n > 0) {
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        for (let i = 0; i < n; i++) {
          x0 = Math.min(x0, x[i] ?? 0);
          x1 = Math.max(x1, x[i] ?? 0);
          y0 = Math.min(y0, y[i] ?? 0);
          y1 = Math.max(y1, y[i] ?? 0);
        }
        const root = quad(x0, y0, Math.max(1, x1 - x0, y1 - y0) * 1.0001);
        for (let i = 0; i < n; i++) quadInsert(root, i, 0, x, y);
        quadSum(root, x, y);
        const k = charge * a;
        for (let i = 0; i < n; i++) quadRepel(root, i, k, theta2, x, y, vx, vy);
      }
      // Gravity, then keep the centre of mass at the origin.
      let mx = 0;
      let my = 0;
      for (let i = 0; i < n; i++) {
        vx[i] = (vx[i] ?? 0) - (x[i] ?? 0) * gx * a;
        vy[i] = (vy[i] ?? 0) - (y[i] ?? 0) * gy * a;
        mx += x[i] ?? 0;
        my += y[i] ?? 0;
      }
      if (n > 0 && sim.fx.every((v) => v === null)) {
        mx /= n;
        my /= n;
        for (let i = 0; i < n; i++) {
          x[i] = (x[i] ?? 0) - mx;
          y[i] = (y[i] ?? 0) - my;
        }
      }
      // Collision: every pair for small graphs; neighbouring grid cells for big ones.
      if (exact) {
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) collide(i, j);
      } else {
        const cell = Math.max(1, maxR * 2 + collidePadding);
        const grid = new Map<number, number[]>();
        const keyOf = (gx: number, gy: number) => (gx + 32_768) * 65_536 + (gy + 32_768);
        const cx = new Int32Array(n);
        const cy = new Int32Array(n);
        for (let i = 0; i < n; i++) {
          cx[i] = Math.floor(((x[i] ?? 0) + (vx[i] ?? 0)) / cell);
          cy[i] = Math.floor(((y[i] ?? 0) + (vy[i] ?? 0)) / cell);
          const key = keyOf(cx[i] ?? 0, cy[i] ?? 0);
          const list = grid.get(key);
          if (list) list.push(i);
          else grid.set(key, [i]);
        }
        for (let i = 0; i < n; i++) {
          for (let gx = (cx[i] ?? 0) - 1; gx <= (cx[i] ?? 0) + 1; gx++)
            for (let gy = (cy[i] ?? 0) - 1; gy <= (cy[i] ?? 0) + 1; gy++) {
              const list = grid.get(keyOf(gx, gy));
              if (list) for (const j of list) if (j > i) collide(i, j);
            }
        }
      }
      // Integrate.
      for (let i = 0; i < n; i++) {
        const px = sim.fx[i];
        const py = sim.fy[i];
        if (px !== null && px !== undefined) {
          x[i] = px;
          vx[i] = 0;
        } else {
          vx[i] = (vx[i] ?? 0) * (1 - velocityDecay);
          x[i] = (x[i] ?? 0) + (vx[i] ?? 0);
        }
        if (py !== null && py !== undefined) {
          y[i] = py;
          vy[i] = 0;
        } else {
          vy[i] = (vy[i] ?? 0) * (1 - velocityDecay);
          y[i] = (y[i] ?? 0) + (vy[i] ?? 0);
        }
      }
    },
  };
  return sim;
}
