// `pnpm outdated:check`: the "latest version of every dependency" gate, as a script.
//
// Runs `pnpm outdated -r --format json` and fails on any dependency that is behind, except the allow-list below.
// Every entry is a deliberate, documented pin: name, the pinned version, and why. An entry stops matching (and the
// gate fails again) the moment the pin changes, so it cannot rot silently.
//
// Needs the network (it asks the registry). When the registry cannot be reached the gate FAILS CLOSED in CI (`CI` is set;
// a silent pass would hide stale dependencies) and WARNS on a developer machine, so an offline `pnpm verify` is not red
// for a reason that is not the code. A dependency that really is outdated fails everywhere. `--offline-ok` forces the warning.

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ name: string; current: string; why: string }[]} */
const ALLOWED = [
  {
    name: "typescript",
    current: "6.0.3",
    why: "root pin: typescript-eslint needs the TypeScript 6 JavaScript API (see eslint.config.js); the theme itself builds on TS 7",
  },
];

const UNREACHABLE =
  /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|META_FETCH_FAIL|FETCH_ERROR|fetch failed|getaddrinfo|network|offline|registry/i;

/**
 * Decide the gate result from one `pnpm outdated -r --format json` run.
 *
 * @param {{ status: number | null; stdout: string; stderr: string }} run The finished pnpm process.
 * @param {{ offlineOk?: boolean }} [options] `offlineOk` turns an unreachable registry into a warning (exit 0).
 * @returns {{ code: number; lines: string[]; stream: "log" | "error" }} Exit code and the lines to print.
 */
export function evaluate(run, options = {}) {
  const stderr = run.stderr || "";
  let report;
  let parsed = true;
  try {
    report = JSON.parse(run.stdout || "{}");
  } catch {
    parsed = false;
  }
  const entries = !parsed
    ? []
    : Array.isArray(report)
      ? report
      : Object.entries(report).map(([name, v]) => ({ name, ...v }));
  // pnpm exits 1 when something is outdated (with entries); a failure with no entries is a failed lookup, not a pass.
  const unreachable =
    run.status === null || (run.status !== 0 && entries.length === 0) || (!parsed && UNREACHABLE.test(stderr));
  if (unreachable || !parsed) {
    const detail = stderr.trim().split("\n").slice(0, 3).join(" | ") || `exit ${run.status}`;
    if (options.offlineOk && unreachable) {
      return {
        code: 0,
        stream: "log",
        lines: [`outdated:check: WARNING registry unreachable, check skipped (--offline-ok): ${detail}`],
      };
    }
    return {
      code: 1,
      stream: "error",
      lines: [
        `outdated:check: registry unreachable, so the dependency check could not run (failing closed in CI; pass --offline-ok to skip offline): ${detail}`,
      ],
    };
  }
  const behind = entries.filter((e) => !ALLOWED.some((a) => a.name === e.name && a.current === e.current));
  if (behind.length) {
    return { code: 1, stream: "error", lines: behind.map((e) => `outdated: ${e.name} ${e.current} -> ${e.latest}`) };
  }
  return {
    code: 0,
    stream: "log",
    lines: [
      `outdated:check: nothing outdated (documented pins held back: ${entries.map((e) => `${e.name}@${e.current}`).join(", ") || "none"})`,
    ],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lookup = () => spawnSync("pnpm", ["outdated", "-r", "--format", "json"], { cwd: root, encoding: "utf8" });
  const options = { offlineOk: process.argv.includes("--offline-ok") || !process.env.CI };
  let result = evaluate(lookup(), options);
  // A lookup that failed without an answer is tried twice more before the gate is skipped: a single dropped
  // request must not turn "something is outdated" into a warning nobody reads.
  for (let attempt = 0; attempt < 2 && result.lines[0]?.includes("registry unreachable"); attempt++) {
    result = evaluate(lookup(), options);
  }
  for (const line of result.lines) console[result.stream](line);
  process.exit(result.code);
}
