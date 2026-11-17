/** The one tile built so far (shared by every caller). */
let tile: Promise<string | null> | null = null;

/**
 * A bitmap grain tile for the backdrop (never SVG feTurbulence in CSS: the browser re-rasterises
 * it per tile and per zoom). Two summed randoms give grain, not speckle. Built once per page
 * and kept (one small blob URL).
 *
 * SheenBackdrop no longer calls this: its grain is a pre-baked PNG tile in styles/backdrop.css
 * (building this one costs a ~100 ms main-thread task at mount). It stays for apps that want a
 * grain of their own tint or size; set the result as `--sheen-grain-img` (and `--sheen-grain-size`).
 *
 * Browser only: it draws on a canvas, so call it from client code after mount, never during server rendering.
 */
export function grainTile(cssSize = 200, rgb: readonly [number, number, number] = [140, 140, 153], maxAlpha = 0.11) {
  tile ??= new Promise((resolve) => {
    try {
      const n = Math.round(cssSize * Math.min(2, window.devicePixelRatio || 1));
      const c = document.createElement("canvas");
      c.width = c.height = n;
      const g = c.getContext("2d");
      if (!g) {
        resolve(null);
        return;
      }
      const img = g.createImageData(n, n);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() + Math.random()) / 2;
        d[i] = rgb[0];
        d[i + 1] = rgb[1];
        d[i + 2] = rgb[2];
        d[i + 3] = Math.round(v * maxAlpha * 255);
      }
      g.putImageData(img, 0, 0);
      c.toBlob((blob) => {
        resolve(blob ? URL.createObjectURL(blob) : null);
      }, "image/png");
    } catch {
      resolve(null);
    }
  });
  return tile;
}
