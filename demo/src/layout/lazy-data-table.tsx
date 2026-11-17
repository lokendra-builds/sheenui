import type { DataTable as DataTableComponent } from "@sheenui/theme";
import { lazyBlock } from "./lazy-block";

/**
 * The data table as an island (see lazy-block.tsx): TanStack Table, the column menu and the table itself are ~30 KB
 * gzip that the docs pages show below their text. The cells and formatters (`CurrencyCell`, `formatCurrency`...) stay
 * normal imports, so a page can build its columns synchronously. Same type as the real `DataTable`, generics included.
 * Eager: on its own page the table is the subject; inside another island (the side-drawer demos, and the examples that
 * build their preview only when they near the viewport) it is requested only when that island renders anyway, so a
 * table scrolled to fast never lands (and grows) after the visitor has gone past it.
 */
export const DataTable = lazyBlock(
  () => import("../../../theme/src/components/data-table/data-table").then((m) => m.DataTable),
  {
    minHeight: "24rem",
    eager: true,
  },
) as unknown as typeof DataTableComponent;

/**
 * The same table for the examples below the first one: requested once the browser is idle (not while the page
 * hydrates), so the page's first long tasks are the one table the visitor is looking at.
 */
export const DataTableLater = lazyBlock(
  () => import("../../../theme/src/components/data-table/data-table").then((m) => m.DataTable),
  { minHeight: "24rem" },
) as unknown as typeof DataTableComponent;
