// A static server that behaves like GitHub Pages for the built site: serves dist/ under the
// base path, resolves `/x` to `x.html` or `x/index.html`, and answers unknown paths with
// 404.html and a real 404 status. Used by the Lighthouse and link checks.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { createGzip } from "node:zlib";

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
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

/** The built HTML file of a route path: "/" is index.html, a hub (a folder with an index.html) is <hub>/index.html, else <path>.html. */
export function routeHtml(dist, path) {
  if (path === "/") return join(dist, "index.html");
  const folder = join(dist, path.slice(1), "index.html");
  return existsSync(folder) ? folder : join(dist, `${path.slice(1)}.html`);
}

/** Resolves a request path (base already stripped) to a file under dist, or null. */
export function resolveFile(dist, path) {
  const safe = normalize(decodeURIComponent(path)).replace(/^(\.\.[/\\])+/, "");
  const candidates = safe.endsWith("/") ? [`${safe}index.html`] : [safe, `${safe}/index.html`, `${safe}.html`];
  for (const c of candidates) {
    const file = join(dist, c);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

/**
 * @param {{ dist: string; basePath: string; port: number }} options
 * @returns {Promise<{ close: () => Promise<void>; origin: string }>}
 */
export function startServer({ dist, basePath, port }) {
  const base = basePath.replace(/\/$/, "");
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let path = url.pathname;
    if (base && path === base) {
      res.writeHead(301, { Location: `${base}/` });
      return res.end();
    }
    if (base && !path.startsWith(`${base}/`)) return notFound(res, dist, req);
    path = path.slice(base.length);
    const file = resolveFile(dist, path);
    if (!file) return notFound(res, dist, req);
    send(res, file, 200, req);
  });
  return new Promise((resolveStart) => {
    server.listen(port, "127.0.0.1", () =>
      resolveStart({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      }),
    );
  });
}

function notFound(res, dist, req) {
  const file = join(dist, "404.html");
  if (existsSync(file)) return send(res, file, 404, req);
  res.writeHead(404);
  res.end("Not found");
}

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".xml", ".txt", ".svg"]);

/** GitHub Pages gzips text responses; so does this server, so Lighthouse's simulated network sees the same bytes. */
function send(res, file, status, req) {
  const ext = extname(file);
  const headers = { "Content-Type": TYPES[ext] ?? "application/octet-stream" };
  if (file.includes("/assets/")) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req?.headers["accept-encoding"] ?? "");
  if (gzip) {
    headers["Content-Encoding"] = "gzip";
    headers["Vary"] = "Accept-Encoding";
  }
  res.writeHead(status, headers);
  const stream = createReadStream(file);
  if (gzip) stream.pipe(createGzip()).pipe(res);
  else stream.pipe(res);
}

// `node scripts/lib/serve.mjs [port]` runs it standalone.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*scripts/, "scripts"))) {
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const demo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const { BASE_PATH } = await import(`file://${demo}/dist-ssr/entry-server.js`);
  const { origin } = await startServer({
    dist: join(demo, "dist"),
    basePath: BASE_PATH,
    port: Number(process.argv[2] ?? 5185),
  });
  console.log(`serving dist at ${origin}${BASE_PATH}`);
}
