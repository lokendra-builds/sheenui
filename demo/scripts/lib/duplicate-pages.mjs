// One indexable URL per page: finds duplicate pages in a built site (the same page at x.html and x/index.html, say).
// A "stub" is a redirect page (meta refresh, no heading) whose canonical is the real page; a "page" has a heading.
// Used by scripts/seo-check.mjs over dist/ and by scripts/test/duplicate-pages.test.mjs.

/** @param {string} html */
export function pageFacts(html) {
  const canonical = /<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"/.exec(html)?.[1] ?? "";
  const refresh = /<meta\b[^>]*http-equiv="refresh"/i.test(html);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  return { canonical, stub: refresh && h1s === 0, page: h1s > 0 };
}

/**
 * @param {{ file: string; html: string }[]} files built HTML files, `file` relative to the site root ("charts/index.html")
 * @param {string} siteUrl the origin and base path, no trailing slash
 * @returns {string[]} one message per problem
 */
export function findDuplicatePages(files, siteUrl) {
  const errors = [];
  const pages = new Map(); // canonical -> file of the real page
  const facts = files.map(({ file, html }) => ({ file, ...pageFacts(html) }));
  for (const f of facts.filter((x) => x.page && x.canonical)) {
    if (pages.has(f.canonical))
      errors.push(`${f.file} and ${pages.get(f.canonical)} are the same page (canonical ${f.canonical})`);
    else pages.set(f.canonical, f.file);
    // The file must be the one that answers the canonical URL: "<path>/index.html" for a URL with a slash, "<path>.html" without.
    const path = f.canonical.slice(siteUrl.length);
    const want =
      path === "/" ? "index.html" : path.endsWith("/") ? `${path.slice(1)}index.html` : `${path.slice(1)}.html`;
    if (f.file !== want) errors.push(`${f.file} carries the canonical ${f.canonical}, which is served from ${want}`);
  }
  for (const f of facts.filter((x) => x.stub)) {
    if (!f.canonical) errors.push(`${f.file} is a redirect stub without a canonical`);
    else if (!pages.has(f.canonical))
      errors.push(`${f.file} is a redirect stub whose canonical ${f.canonical} is no page`);
  }
  return errors;
}
