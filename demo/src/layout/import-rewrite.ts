import generated from "../generated/install-paths";

type InstallPaths = { barrel: Record<string, string>; demoData: Record<string, string> };

/** The generated table lists each file's export names; the rewrite looks a name up. */
const invert = (byFile: Record<string, string[]>) =>
  Object.fromEntries(Object.entries(byFile).flatMap(([file, names]) => names.map((name) => [name, file])));
const paths: InstallPaths = { barrel: invert(generated.barrel), demoData: invert(generated.demoData) };

const IMPORT_RE = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+"@sheenui\/theme(\/demo-data)?";?/g;

/**
 * Rewrites `import { Button, type ButtonProps } from "@sheenui/theme"` to one import per installed file:
 * `import { Button, type ButtonProps } from "@/components/sheenui/button/button"`. Names it cannot place stay on a package import.
 */
function rewriteImports(code: string, paths: InstallPaths): string {
  return code.replace(IMPORT_RE, (whole, typeOnly: string | undefined, list: string, demo: string | undefined) => {
    const map = demo ? paths.demoData : paths.barrel;
    const byFile = new Map<string, string[]>();
    const unknown: string[] = [];
    for (const raw of list.split(",")) {
      const item = raw.trim();
      if (!item) continue;
      const name =
        item
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]
          ?.trim() ?? "";
      const file = map[name];
      if (!file) {
        unknown.push(item);
        continue;
      }
      const target = `@/components/sheenui/${file.replace(/^components\//, "")}`;
      byFile.set(target, [...(byFile.get(target) ?? []), item]);
    }
    const prefix = typeOnly ? "import type" : "import";
    const lines = [...byFile]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([target, items]) => `${prefix} { ${items.join(", ")} } from "${target}";`);
    if (unknown.length) lines.push(`${prefix} { ${unknown.join(", ")} } from "@sheenui/theme${demo ?? ""}";`);
    return lines.length ? lines.join("\n") : whole;
  });
}

/**
 * Rewrites a sample's package imports to the installed files with the generated path table. This module and the table
 * are one lazy chunk: the rewriting only runs once the table has arrived (import-mode.ts), so none of it is in
 * the initial JavaScript of a page.
 */
export const rewriteWithInstallPaths = (code: string) => rewriteImports(code, paths);
