import { Pagination } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { PaginationScene } from "./ShowcaseStage.pagination";

/** The live Pagination on its stage: the numbers and ellipses always fill the same number of slots. */
export function PaginationScene({ scene }: { scene: PaginationScene; ctx: StageContext }) {
  const [page, setPage] = useFollow(scene.page);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">
        Results {page * 10 - 9} to {page * 10}
      </p>
      <Pagination page={page} onPageChange={setPage} pageCount={32} aria-label="Search results" />
    </div>
  );
}
