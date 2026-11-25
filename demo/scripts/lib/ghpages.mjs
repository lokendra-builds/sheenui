// A tiny static server that behaves like GitHub Pages for a project site under a base path, including the
// behaviour that matters for hub pages that are also folders (/charts → charts.html and charts/index.html):
//   /x        a folder named x exists → 301 to /x/ (the worst case: the folder wins over x.html); else x.html
//   /x/       x/index.html, or 404.html with a 404 status when the folder has no index
//   /sheenui  → 301 to /sheenui/
// scripts/hosting-check.mjs loads every hub through it in a real browser and fails on a redirect loop.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const isFile = (f) => existsSync(f) && statSync(f).isFile();
const isDir = (f) => existsSync(f) && statSync(f).isDirectory();

/**
 * @param {{ dist: string; basePath: string; port: number; log?: string[] }} options `log` collects "STATUS path" lines.
 */
export function startGithubPagesServer({ dist, basePath, port, log = [] }) {
  const base = basePath.replace(/\/$/, "");
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const done = (status, extra = {}) => {
      log.push(`${status} ${url.pathname}`);
      return res.writeHead(status, extra);
    };
    const notFound = () => {
      const file = join(dist, "404.html");
      done(404, { "content-type": TYPES[".html"] });
      return isFile(file) ? createReadStream(file).pipe(res) : res.end("not found");
    };
    if (base && url.pathname === base) {
      done(301, { location: `${base}/` });
      return res.end();
    }
    if (base && !url.pathname.startsWith(`${base}/`)) return notFound();
    const rel = normalize(decodeURIComponent(url.pathname.slice(base.length))).replace(/^(\.\.[/\\])+/, "");
    let file;
    if (rel.endsWith("/")) file = join(dist, rel, "index.html");
    else if (isDir(join(dist, rel))) {
      done(301, { location: `${base}${rel}/${url.search}` });
      return res.end();
    } else file = [join(dist, rel), join(dist, `${rel}.html`)].find(isFile);
    if (!file || !isFile(file)) return notFound();
    done(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () =>
      resolve({ origin: `http://127.0.0.1:${port}`, log, close: () => new Promise((r) => server.close(() => r())) }),
    );
  });
}
