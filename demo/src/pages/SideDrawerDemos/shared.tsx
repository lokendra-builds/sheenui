export { wait } from "../../demo-utils";
/*
 * The live demos of /overlays/side-drawer (SideDrawerPage.tsx), loaded as islands (layout/lazy-block.tsx): this
 * module, with the drawer, its form and detail views, Select, Menu, the data table and the sample data behind the
 * demos, is a chunk the page fetches after it has hydrated, so the page's initial JS is only the docs around them.
 * The page keeps each demo's code string (scripts/lib/routes-source.mjs reads them from the page file).
 */

/* ---------- Small helpers ---------- */

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function Icon({ d, className = "size-4" }: { d: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export const icons = {
  pencil: "M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3zM13.5 8.5l3 3",
  copy: "M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  archive: "M3 4h18v4H3zM5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  cart: "M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2M10 20h.01M17 20h.01",
  card: "M3 6h18v12H3zM3 10h18",
  truck:
    "M3 6h11v10H3zM14 9h4l3 3v4h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  tag: "M3 12V4h8l9 9-8 8zM7.5 7.5h.01",
  check: "M5 12.5l4.5 4.5L19 7.5",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6",
  note: "M4 4h16v12H8l-4 4z",
};

export type Note = { id: string; author: string; text: string; at: string };
