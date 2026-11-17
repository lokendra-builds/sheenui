/**
 * A lazy chunk that fails to load (typically after a deploy replaced the hashed files under an open tab) would leave a
 * blank page. Vite reports it as `vite:preloadError`: reload once to pick up the new files. A sessionStorage stamp keeps
 * a chunk that is still missing from reload-looping; the second failure falls through to the error boundary
 * (layout/RouteErrorBoundary.tsx), which offers a manual Reload and a link home.
 */
const KEY = "sheen:chunk-reload";
/** A second failure inside this window is not reloaded again. */
const WINDOW_MS = 30_000;

function shouldReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY));
    if (last && Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
    return true;
  } catch {
    // Storage blocked: no loop guard is possible, so never auto-reload; the boundary handles it.
    return false;
  }
}

window.addEventListener("vite:preloadError", (event) => {
  if (!shouldReload()) return;
  event.preventDefault();
  window.location.reload();
});
