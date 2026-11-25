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

/** More registry items than this and the panel's command installs only the first (the list says to swap the name for another). */
export const MANY_ITEMS = 6;

/**
 * @param {{ f: string[]; e: number[][]; p: number[][]; pn: string[]; i: number[]; in: string[]; rd: Record<string, string[]> }} graph
 * @param {string[]} sources repo-relative paths from the page's `source` prop
 * @param {string[]} [samples] repo-relative files of the components the page's code samples import besides its own source
 * @returns {{ units: string[]; files: string[]; packages: string[]; items: string[]; also: { units: string[]; items: string[]; packages: string[] } }}
 *   `also` is what the examples need on top of the page's own list (a Dialog example that uses Button): files and registry items
 *   that the page's own item does not install. It stays empty when the samples add nothing.
 */
export function resolveCopyList(graph, sources, samples = []) {
  const own = resolveOwn(graph, sources);
  if (samples.length === 0) return { ...own, also: { units: [], items: [], packages: [] } };
  const all = resolveOwn(graph, [...sources, ...samples]);
  const have = new Set(own.files);
  const extraFiles = new Set(all.files.filter((f) => !have.has(f)));
  // What the shown install command installs: every own item, or only the first when the list is long (the panel's command
  // installs the first and says to swap the name). The items the page's own item depends on, transitively, are covered too.
  const commanded = own.items.length > MANY_ITEMS ? own.items.slice(0, 1) : own.items;
  const covered = new Set(commanded);
  const stack = [...commanded];
  while (stack.length) {
    for (const dep of graph.rd[stack.pop()] ?? []) {
      if (covered.has(dep)) continue;
      covered.add(dep);
      stack.push(dep);
    }
  }
  // Every item the samples import, not pruned by what another item implies: the Markdown twin and seo:check read this same list.
  const extraItems = resolveOwn(graph, samples, false).items.filter((n) => !covered.has(n));
  const units = extraFiles.size ? fold(graph, extraFiles).sort(byRank) : [];
  return {
    ...own,
    also: { units, items: extraItems, packages: all.packages.filter((p) => !own.packages.includes(p)) },
  };
}

function byRank(a, b) {
  return unitRank(a) - unitRank(b) || a.localeCompare(b);
}

function resolveOwn(graph, sources, prune = true) {
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
  if (prune && pruned.length > 0) items = pruned;
  return { units, files, packages: [...packages].sort(), items: items.sort() };
}
