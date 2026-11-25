import { GALLERY_A } from "./gallery-entries-a";
import { GALLERY_B } from "./gallery-entries-b";
import type { GalleryEntry } from "./gallery-types";

/** Every chart of the theme as a gallery entry (a live preview), in page order. */
export const GALLERY: GalleryEntry[] = [...GALLERY_A, ...GALLERY_B];
export { CATEGORIES, type GalleryCategory, type GalleryEntry } from "./gallery-types";
