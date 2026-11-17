import { useId } from "react";

/** "Sizes and icons" → "sizes-and-icons": the anchor of a section heading. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * The id of a section heading: the slug of its text, so the same on the server, on hydration and after a
 * client-side navigation, and a link like /components/button#props keeps working when the layout changes.
 * (React's useId changes whenever the tree does.) Two headings with the same text on one page would share an
 * id: seo:check fails on that, and the fix is a more specific heading. With no text it falls back to useId.
 */
export function useHeadingId(text: string | undefined) {
  const fallback = useId();
  const slug = text ? slugify(text) : "";
  return slug || fallback;
}
