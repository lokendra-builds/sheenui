/**
 * Displacement maps for <LiquidGlass>: one PNG per lens size, drawn once on a canvas and
 * cached, then fed to an SVG feDisplacementMap through feImage. The same pass draws the
 * mask that thins a regular lens's tint towards its rim.
 *
 * How a map is read (feDisplacementMap): every output pixel P samples the backdrop at
 *   P + scale × (R − 0.5, G − 0.5)
 * so mid-grey (128, 128) means "no shift". The red and green channels hold how far, and in
 * which direction, the glass bends the light at that pixel.
 *
 * The lens is a rounded rectangle (a pill or a circle when the radius is half the short side)
 * with a curved rim (the bezel) and a flat centre. The rim's height follows a squircle,
 * h(t) = (1 − (1 − t)⁴)^¼, t = 0 at the outer edge and 1 where the flat top begins: it rises
 * steeply at the edge and flattens out smoothly, which is what makes Apple's glass look thick.
 * Light entering that curved surface refracts (Snell's law, glass n ≈ 1.5), so the shift is
 * largest at the very edge and fades to nothing at the inner end of the rim.
 */

/** Refractive index of glass. */
const IOR = 1.5;
const LUT_SIZE = 256;
/** Biggest map we draw. Larger lenses get a smaller map, stretched (it is smooth, so this is invisible). */
const MAX_PIXELS = 240_000;
const CACHE_LIMIT = 32;

let profile: Float32Array | null = null;

/** Normalised refraction strength (0..1) across the rim, sampled from the outer edge (0) inwards (1). */
function refractionProfile(): Float32Array {
  if (profile) return profile;
  const lut = new Float32Array(LUT_SIZE);
  let max = 0;
  for (let i = 0; i < LUT_SIZE; i++) {
    const t = i / (LUT_SIZE - 1);
    const s = 1 - t;
    // Slope of the squircle rim, dh/dt. Infinite at the edge, 0 where the top flattens.
    const slope = s ** 3 / Math.max(1 - s ** 4, 1e-6) ** 0.75;
    const incidence = Math.atan(slope);
    const refracted = Math.asin(Math.sin(incidence) / IOR);
    // How far the bent ray lands from where a straight one would (thicker glass near the centre).
    const height = (1 - s ** 4) ** 0.25;
    const shift = Math.tan(incidence - refracted) * (0.35 + 0.65 * height);
    lut[i] = shift;
    if (shift > max) max = shift;
  }
  for (let i = 0; i < LUT_SIZE; i++) lut[i] = (lut[i] ?? 0) / max;
  profile = lut;
  return lut;
}

/** Geometry of a refraction lens in CSS pixels: size, corner radius and rim (bezel) width. */
export type LensMapOptions = {
  /** Lens size in CSS pixels. */
  width: number;
  height: number;
  /** Corner radius in CSS pixels (clamped to half the short side). */
  radius: number;
  /** Width of the curved rim in CSS pixels (clamped to the radius, so corners have no seam). */
  bezel: number;
};

/** Effective radius and rim width for a lens, after clamping. */
export function lensGeometry({ width, height, radius, bezel }: LensMapOptions) {
  const half = Math.min(width, height) / 2;
  const r = Math.max(0, Math.min(radius, half));
  const b = Math.max(1, Math.min(bezel, r || half, half));
  return { radius: r, bezel: b };
}

/** Tint left at the very edge of a regular lens (share of its full tint), so the bent rim shows through. */
const EDGE_TINT = 0.3;
/** Width of the tint's fade at the edge: the outer part of the rim, where the light bends most. */
const TINT_FADE_MAX = 14;

/** The PNG data URLs `LiquidGlass` feeds its SVG filter: the displacement map and the tint mask. */
export type LensImages = {
  /** Displacement map for feDisplacementMap. */
  map: string;
  /**
   * Alpha mask for a regular lens's tint: full inside, thinning to EDGE_TINT across the outer
   * part of the rim, so the refraction there stays visible while text inside keeps its backplate.
   */
  tint: string;
};

const cache = new Map<string, LensImages>();

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * PNG data URLs of the displacement map and tint mask for a lens, or null when there is no DOM
 * (SSR) or the lens has no area. Cached by size, so lenses of the same size share them.
 */
export function lensImages(options: LensMapOptions): LensImages | null {
  if (typeof document === "undefined") return null;
  const width = Math.round(options.width);
  const height = Math.round(options.height);
  if (width < 2 || height < 2) return null;
  const { radius, bezel } = lensGeometry({ ...options, width, height });

  const key = `${width}x${height}r${radius.toFixed(1)}b${bezel.toFixed(1)}`;
  const hit = cache.get(key);
  if (hit) {
    // Refresh its place in the LRU order.
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }

  // Draw at a lower resolution for big lenses; feImage stretches it back.
  const k = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)));
  const w = Math.max(2, Math.round(width * k));
  const h = Math.max(2, Math.round(height * k));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  // A CPU-backed canvas: this one is only ever written with putImageData and read back as a PNG. On a GPU canvas that
  // read-back waits for the GPU process, which is busy painting the first frames of the page (a stall of 100-300 ms
  // on the main thread during load, the largest blocking task on the home page in Lighthouse).
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const image = ctx.createImageData(w, h);
  const data = image.data;
  const tintImage = ctx.createImageData(w, h);
  const tint = tintImage.data;
  const tintFade = Math.max(1, Math.min(bezel * 0.7, TINT_FADE_MAX) * k);
  const lut = refractionProfile();
  const r = radius * k;
  const rim = bezel * k;
  const hx = w / 2;
  const hy = h / 2;
  // Half-size of the inner rectangle whose rounded offset is the lens outline.
  const ix = hx - r;
  const iy = hy - r;

  for (let y = 0; y < h; y++) {
    const py = y + 0.5 - hy;
    const ay = Math.abs(py);
    const sy = py < 0 ? -1 : 1;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const px = x + 0.5 - hx;
      const ax = Math.abs(px);
      const sx = px < 0 ? -1 : 1;

      // Signed distance to the rounded rectangle (negative inside) and its outward normal.
      const qx = ax - ix;
      const qy = ay - iy;
      let distance: number;
      let nx: number;
      let ny: number;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy);
        distance = len - r;
        nx = (qx / len) * sx;
        ny = (qy / len) * sy;
      } else if (qx > qy) {
        distance = qx - r;
        nx = sx;
        ny = 0;
      } else {
        distance = qy - r;
        nx = 0;
        ny = sy;
      }

      const depth = -distance;
      let strength = 0;
      if (depth < rim) {
        // Pixels on (or just past) the anti-aliased edge keep the edge's full strength.
        const t = Math.max(0, depth) / rim;
        strength = lut[Math.min(LUT_SIZE - 1, Math.round(t * (LUT_SIZE - 1)))] ?? 0;
      }
      // Sample from further inside the lens: the rim pulls the backdrop in and bends it.
      data[i] = 128 - nx * strength * 127;
      data[i + 1] = 128 - ny * strength * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
      // The tint mask only uses alpha.
      tint[i + 3] = Math.round(255 * (EDGE_TINT + (1 - EDGE_TINT) * smoothstep(depth / tintFade)));
    }
  }

  ctx.putImageData(image, 0, 0);
  const map = canvas.toDataURL("image/png");
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(tintImage, 0, 0);
  const images = { map, tint: canvas.toDataURL("image/png") };
  cache.set(key, images);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return images;
}

/**
 * Whether this browser renders SVG filters in backdrop-filter (`backdrop-filter: url(#id)`).
 * Only Chromium does; Safari and Firefox accept the syntax but draw nothing, so there is no
 * feature test: the engine is detected instead (iOS Chrome is WebKit, so it is excluded).
 */
export function supportsBackdropSvgFilter(): boolean {
  if (typeof navigator === "undefined") return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  if (brands?.length) return brands.some((b) => b.brand === "Chromium");
  const ua = navigator.userAgent;
  return /\bChrom(e|ium)\/\d/.test(ua) && !/\b(CriOS|FxiOS|EdgiOS)\b/.test(ua);
}
