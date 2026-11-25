import { useState } from "react";
import { Pagination, defaultPaginationLabels } from "@sheenui/theme";

/* A live example of /docs/rtl in its own chunk, so the page loads only the code a visible example needs (see RtlDocsPage.tsx). */

const germanLabels = {
  ...defaultPaginationLabels,
  nav: "Seitennavigation",
  first: "Erste Seite",
  previous: "Vorherige Seite",
  next: "Nächste Seite",
  last: "Letzte Seite",
  page: (page: number) => `Seite ${page}`,
  morePages: "Weitere Seiten",
  pageOf: (page: number, pageCount: number) => `Seite ${page} von ${pageCount}`,
};

/** Pagination with German labels. */
export function GermanDemo() {
  const [page, setPage] = useState(5);
  return <Pagination page={page} onPageChange={setPage} pageCount={20} labels={germanLabels} />;
}
