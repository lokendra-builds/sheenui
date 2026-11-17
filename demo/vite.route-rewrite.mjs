// The pure text rewrite behind vite.page-instances.mjs's route step, kept apart so scripts/test can cover it.

/** `lazyPage(<loader const | inline import>, (m) => m.Name)`, either quote style. */
const LAZY_PAGE = /lazyPage\(\s*(?:\(\)\s*=>\s*import\((["'])([^"']+)\1\)|(\w+))\s*,\s*\(m\)\s*=>\s*m\.(\w+),?\s*\)/g;
export const LOADER_CONST = /^const\s+(\w+)\s*=\s*\(\)\s*=>\s*import\((["'])([^"']+)\2\);?[ \t]*\n/gm;

/**
 * Points each `lazyPage(...)` of a route table at a per-route instance of its page module.
 * @param {string} code the route file's text
 * @param {string} up how the file reaches src/: "./" (routes.ts) or "../" (routes/*.ts)
 * @param {(spec: string) => string} withExtension "./pages/X" → "./pages/X.tsx" (checked on disk)
 */
export function rewriteRouteLoaders(code, up, withExtension) {
  const loaders = {};
  for (const m of code.matchAll(LOADER_CONST)) loaders[m[1]] = m[3];
  return code
    .replace(LAZY_PAGE, (whole, _q, inline, ident, name) => {
      const spec = inline ?? loaders[ident];
      if (!spec || !spec.startsWith(`${up}pages/`)) return whole;
      const page = withExtension(`./${spec.slice(up.length)}`).slice(2);
      return `lazyPage(() => import("${up}${page}?page=${name}"), (m) => m.default)`;
    })
    .replace(LOADER_CONST, "");
}
