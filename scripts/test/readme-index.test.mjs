// node:test for scripts/readme-index.mjs in a fresh clone of the public repo: .github/ (CI config), docs/ (private guides) and
// the optional local notes and their git-ignored config (.handoff/) are absent, and `--check` must still run to the end.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { isAppleDouble, withoutAppleDouble } from "../lib/fs-filter.mjs";

const REAL = join(import.meta.dirname, "..", "..");
const ABSENT = new Set([".github", "docs", "scripts", ".handoff"]);

/** A checkout with the optional folders removed: everything else is a symlink to the real tree, scripts/ is a copy (ROOT is derived from its location). */
function freshClone() {
  const dir = mkdtempSync(join(tmpdir(), "sheenui-fresh-"));
  for (const name of readdirSync(REAL)) {
    if (isAppleDouble(name) || ABSENT.has(name)) continue;
    symlinkSync(join(REAL, name), join(dir, name));
  }
  cpSync(join(REAL, "scripts"), join(dir, "scripts"), { recursive: true, filter: (src) => !src.includes("/._") });
  return dir;
}

test("readme-index --check runs to the end without .github, docs/guides and the local working files", () => {
  const dir = freshClone();
  try {
    assert.equal(existsSync(join(dir, ".github")), false);
    assert.equal(existsSync(join(dir, "docs")), false);
    const run = spawnSync(process.execPath, [join(dir, "scripts", "readme-index.mjs"), "--check"], {
      cwd: dir,
      encoding: "utf8",
    });
    assert.doesNotMatch(run.stderr, /ENOENT|no such file/i, run.stderr);
    assert.match(run.stdout, /ci\.yml not present, CI-drift check skipped/);
    assert.match(run.stdout, /docs\/guides not present, guide-claim check skipped/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the AppleDouble filter drops ._* names and keeps real ones", () => {
  assert.deepEqual(withoutAppleDouble(["a.ts", "._a.ts", "b"]), ["a.ts", "b"]);
  assert.deepEqual(withoutAppleDouble([{ name: "._x" }, { name: "x" }]), [{ name: "x" }]);
  assert.equal(isAppleDouble("._.DS_Store"), true);
  assert.equal(isAppleDouble("a._b"), false);
});
