// node:test for the split-table readers (demo/scripts/lib) and the route rewrite behind vite.page-instances.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { routeModules } from "../../demo/scripts/lib/routes-source.mjs";
import { readSplitSource, splitFiles } from "../../demo/scripts/lib/split-source.mjs";
import { rewriteRouteLoaders } from "../../demo/vite.route-rewrite.mjs";

/** A temp demo/src with the given files (path relative to src → text). */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "split-source-"));
  for (const [rel, text] of Object.entries(files)) {
    const file = join(root, "src", rel);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, text);
  }
  return join(root, "src");
}

test("parts follow the index's import order, not the alphabet", () => {
  const src = fixture({
    "routes.ts": 'import { b } from "./routes/b";\nimport { a } from "./routes/a";\n',
    "routes/a.ts": "A",
    "routes/b.ts": "B",
  });
  const names = splitFiles(join(src, "routes.ts")).map((f) => f.slice(src.length));
  assert.deepEqual(names, ["/routes.ts", "/routes/b.ts", "/routes/a.ts"]);
  assert.match(readSplitSource(join(src, "routes.ts")), /B\nA$/);
});

test("single quotes, explicit extensions and .tsx parts are read", () => {
  const src = fixture({
    "routes.ts":
      "import { a } from './routes/a.ts';\nimport { b } from './routes/b';\nimport { c } from \"./routes/c\";\n",
    "routes/a.ts": "A",
    "routes/b.tsx": "B",
    "routes/c.ts": "C",
  });
  assert.equal(splitFiles(join(src, "routes.ts")).length, 4);
});

test("commented-out imports are ignored", () => {
  const src = fixture({
    "routes.ts":
      '// import { x } from "./routes/gone";\n/* import { y } from "./routes/gone2"; */\nimport { a } from "./routes/a";\n',
    "routes/a.ts": "A",
  });
  assert.equal(splitFiles(join(src, "routes.ts")).length, 2);
});

test("a part the folder lacks is a clear error", () => {
  const src = fixture({ "routes.ts": 'import { a } from "./routes/missing";\n' });
  assert.throws(() => splitFiles(join(src, "routes.ts")), /part "missing".*does not exist/);
});

test("a table that is not split reads as the one file", () => {
  const src = fixture({ "seo/meta.ts": "export const x = 1;\n" });
  assert.deepEqual(splitFiles(join(src, "seo/meta.ts")), [join(src, "seo/meta.ts")]);
});

test("routeModules resolves inline imports and loader consts, in both quote styles", () => {
  const src = fixture({
    "routes.ts": 'import { g } from "./routes/g";\n',
    "routes/g.ts": [
      "const hubs = () => import('../pages/HubPages');",
      "export const g = [",
      '  { path: "/a", ...lazyPage(hubs, (m) => m.APage) },',
      "  { path: '/b', ...lazyPage(() => import('../pages/BPage.tsx'), (m) => m.BPage) },",
      '  { path: "/c", ...lazyPage(() => import("../pages/CPage"), (m) => m.CPage) },',
      "];",
    ].join("\n"),
  });
  const routes = routeModules(join(src, "routes.ts"));
  assert.deepEqual(routes.get("/a"), { module: "src/pages/HubPages.tsx", exportName: "APage" });
  assert.deepEqual(routes.get("/b"), { module: "src/pages/BPage.tsx", exportName: "BPage" });
  assert.deepEqual(routes.get("/c"), { module: "src/pages/CPage.tsx", exportName: "CPage" });
});

test("rewriteRouteLoaders gives each route its own ?page= instance", () => {
  const code = [
    'const hubs = () => import("../pages/HubPages");',
    "const x = [",
    "  lazyPage(hubs, (m) => m.APage),",
    "  lazyPage(() => import('../pages/B'), (m) => m.BPage),",
    '  lazyPage(() => import("../elsewhere/C"), (m) => m.CPage),',
    "];",
  ].join("\n");
  const out = rewriteRouteLoaders(code, "../", (spec) => `${spec}.tsx`);
  assert.match(out, /lazyPage\(\(\) => import\("\.\.\/pages\/HubPages\.tsx\?page=APage"\), \(m\) => m\.default\)/);
  assert.match(out, /import\("\.\.\/pages\/B\.tsx\?page=BPage"\)/);
  assert.match(out, /lazyPage\(\(\) => import\("\.\.\/elsewhere\/C"\), \(m\) => m\.CPage\)/);
  assert.doesNotMatch(out, /^const hubs/m);
});

test("resolvePageModule follows lazyBlock wrappers (recursively, cycle-safe)", async () => {
  const { resolvePageModule, pageSources } = await import("../../demo/scripts/lib/routes-source.mjs");
  const demo = mkdtempSync(join(tmpdir(), "resolve-"));
  mkdirSync(join(demo, "src", "pages"), { recursive: true });
  const w = (n, t) => writeFileSync(join(demo, "src", "pages", n), t);
  w("APage.tsx", 'export const APage = lazyBlock(() => import("./ABody").then((m) => m.Inner), island);\n');
  w("ABody.tsx", 'export const Inner = lazy(() => import("./ACore"));\n');
  w(
    "ACore.tsx",
    'export function Inner2() {}\nexport function Inner() { return <Page source="theme/src/components/a/a.tsx" />; }\n',
  );
  w("Loop.tsx", 'export const L = lazyBlock(() => import("./Loop").then((m) => m.L), island);\n');
  // ABody's Inner is lazy with default export -> ACore default; point the chain at a real function instead
  w("ABody.tsx", 'export const Inner = lazyBlock(() => import("./ACore").then((m) => m.Inner), island);\n');
  const r = resolvePageModule(demo, "src/pages/APage.tsx", "APage");
  assert.equal(r.module, "src/pages/ACore.tsx");
  assert.equal(r.exportName, "Inner");
  assert.deepEqual(pageSources(r.text, r.exportName), ["theme/src/components/a/a.tsx"]);
  assert.equal(resolvePageModule(demo, "src/pages/Loop.tsx", "L").module, "src/pages/Loop.tsx");
});
