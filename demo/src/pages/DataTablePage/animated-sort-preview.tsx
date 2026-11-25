import { useState } from "react";
import { AnimatedList, AnimatedListItem, Button } from "@sheenui/theme";
import { DataTableLater } from "../../layout/lazy-data-table";
import { invoiceColumns, invoices } from "./data-table-more";

/** The preview of the "Animated sort" example: a separate chunk (see animated-sort.tsx), so AnimatedList stays out of the page's initial JS. */
export function AnimatedSortPreview({ animate }: { animate: boolean }) {
  const [names, setNames] = useState(() => invoices.map((invoice) => invoice.customer));
  return (
    <div className="flex w-full flex-col gap-4">
      <DataTableLater
        caption="Recent invoices"
        data={invoices}
        columns={invoiceColumns}
        animateRows={animate}
        hidePagination
      />
      <div>
        <Button size="sm" variant="ghost" onClick={() => setNames((list) => [...list].reverse())}>
          Reverse the list
        </Button>
        <AnimatedList className="mt-2 flex flex-col gap-1">
          {names.map((name) => (
            <AnimatedListItem key={name} className="rounded-md px-3 py-1.5 text-sm">
              {name}
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
