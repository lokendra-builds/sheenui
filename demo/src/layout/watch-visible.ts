/**
 * Resolves once `el` is within a viewport's height of the screen (at once when it already is). For code that sits below
 * the fold and should not be fetched until the visitor nears it (the export summaries, ExportBlocks.tsx): it keeps its
 * Suspense boundary dehydrated, so the server HTML stays until the code is in. Lives in a lazy chunk, not in the initial JS.
 */
export function whenNear(el: Element) {
  return new Promise<void>((resolve) => {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        resolve();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
  });
}
