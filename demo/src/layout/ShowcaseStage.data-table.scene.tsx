import { useMemo } from "react";
import type { DataTableColumn } from "@sheenui/theme";

import { DataTable } from "./lazy-data-table";
import type { DataTableScene } from "./ShowcaseStage.data-table";

type Deal = { id: string; name: string; stage: string; amount: number };

const DEALS: Deal[] = [
  { id: "d1", name: "Northwind", stage: "Proposal", amount: 4200 },
  { id: "d2", name: "Acme Corp", stage: "Won", amount: 9800 },
  { id: "d3", name: "Globex", stage: "Lead", amount: 1500 },
  { id: "d4", name: "Initech", stage: "Won", amount: 6400 },
  { id: "d5", name: "Umbrella", stage: "Proposal", amount: 3100 },
];

const COLUMNS: DataTableColumn<Deal>[] = [
  { id: "name", header: "Deal", accessorKey: "name" },
  { id: "stage", header: "Stage", accessorKey: "stage", enableSorting: false },
  { id: "amount", header: "Amount", accessorKey: "amount", numeric: true },
];

/** The live DataTable on its stage: a real, sortable table whose rows slide to their new place when the story sorts it. */
export function DataTableScene({ scene }: { scene: DataTableScene }) {
  const sorting = useMemo(
    () =>
      scene.sort === "amount"
        ? [{ id: "amount", desc: true }]
        : scene.sort === "name"
          ? [{ id: "name", desc: false }]
          : [],
    [scene.sort],
  );
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <DataTable<Deal>
        caption="Open deals"
        data={DEALS}
        columns={COLUMNS}
        sorting={sorting}
        onSortingChange={() => undefined}
        enableSearch={false}
        enableViewOptions={false}
        enableExport={false}
        hidePagination
        getRowLabel={(d) => d.name}
      />
    </div>
  );
}
