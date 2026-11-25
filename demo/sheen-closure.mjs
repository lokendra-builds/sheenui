// Pure helpers (no Node imports, so the docs page can use them in the browser) that turn the
// import graph from vite.sheen-deps.mjs into what a docs page lists under "Files to copy":
// the exact transitive FILE closure of the page's source files, folded into folders only where
// every file of a folder is in it, plus the npm packages and shadcn registry items involved.
//
// Graph (compact, JSON): f = theme/src-relative files, e = direct local imports (indexes into f),
// p = npm packages per file (indexes into pn), i = owning registry item per file (index into in, or -1),
// rd = registry dependencies per item name.

const UNIT_ORDER = ["components/", "blocks/", "hooks/", "motion/", "lib/", "styles/"];
const THEME_ROOT = "theme/src/";

function unitRank(unit) {
  const i = UNIT_ORDER.findIndex((p) => unit.startsWith(p));
  return i === -1 ? UNIT_ORDER.length : i;
}

/** Indexes of the graph files a docs page `source` (file or folder, repo-relative) stands for. */
function matchSources(graph, sources) {
  const hits = new Set();
  for (const src of sources) {
    const rel = src.replace(THEME_ROOT, "").replace(/\/$/, "");
    graph.f.forEach((file, idx) => {
      if (file === rel || file.startsWith(`${rel}/`)) hits.add(idx);
    });
  }
  return hits;
}

/** Folds a set of file paths into folders where a folder is covered completely. */
function fold(graph, covered) {
  const all = graph.f;
  const units = [];
  const visit = (dir, files) => {
    // `files` = every graph file under `dir`
    if (files.length > 0 && files.every((f) => covered.has(f))) {
      units.push(`${dir}/`);
      return;
    }
    const direct = new Map();
    for (const f of files) {
      const rest = f.slice(dir.length + 1);
      const slash = rest.indexOf("/");
      if (slash < 0) {
        if (covered.has(f)) units.push(f);
      } else {
        const child = `${dir}/${rest.slice(0, slash)}`;
        if (!direct.has(child)) direct.set(child, []);
        direct.get(child).push(f);
      }
    }
    for (const [child, list] of direct) visit(child, list);
  };
  const top = new Map();
  for (const f of all) {
    const slash = f.indexOf("/");
    if (slash < 0) continue; // barrel (index.ts) and other root files are not copied
    const dir = f.slice(0, slash);
    if (!top.has(dir)) top.set(dir, []);
    top.get(dir).push(f);
  }
  for (const [dir, list] of top) visit(dir, list);
  return units;
}

/**
 * @param {{ f: string[]; e: number[][]; p: number[][]; pn: string[]; i: number[]; in: string[]; rd: Record<string, string[]> }} graph
 * @param {string[]} sources repo-relative paths from the page's `source` prop
 * @returns {{ units: string[]; files: string[]; packages: string[]; items: string[] }}
 */
export function resolveCopyList(graph, sources) {
  const start = matchSources(graph, sources);
  const seen = new Set();
  const stack = [...start];
  while (stack.length) {
    const idx = stack.pop();
    if (seen.has(idx)) continue;
    seen.add(idx);
    for (const dep of graph.e[idx] ?? []) stack.push(dep);
  }
  const files = [...seen].map((i) => graph.f[i]).sort();
  const covered = new Set(files);
  const packages = new Set();
  for (const idx of seen) for (const p of graph.p[idx] ?? []) packages.add(graph.pn[p]);

  const own = [...start].map((i) => graph.f[i]);
  const rank = (unit) =>
    own.some((f) => f === unit || (unit.endsWith("/") && f.startsWith(unit))) ? -1 : unitRank(unit);
  const units = fold(graph, covered).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  units.push("styles/");

  // Registry items that own the page's own files; drop an item another listed item already depends on.
  let items = [...new Set([...start].map((i) => graph.in[graph.i[i]]).filter((n) => n && n !== "sheenui-theme"))];
  const implied = new Set(items.flatMap((n) => graph.rd[n] ?? []));
  const pruned = items.filter((n) => !implied.has(n));
  if (pruned.length > 0) items = pruned;
  return { units, files, packages: [...packages].sort(), items: items.sort() };
}
