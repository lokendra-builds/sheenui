import { useState } from "react";
import { Switch } from "@sheenui/theme";
import { Example } from "../../layout/Example";
import { lazyBlock } from "../../layout/lazy-block";

// minHeight is the finished preview (578px beside this example's title and controls, measured on the built page), so the
// placeholder that shows while its chunk arrives holds the same height and the examples below do not move.
const AnimatedSortPreviewLazy = lazyBlock(() => import("./animated-sort-preview").then((m) => m.AnimatedSortPreview), {
  minHeight: "36.125rem",
});

export function AnimatedSortExample() {
  const [animate, setAnimate] = useState(true);
  return (
    <Example
      title="Animated sort"
      lazyPreview
      deferRender
      intrinsicHeight={770}
      description="Click a column header: rows slide to their new place (transform only, spring.smooth) instead of swapping. It is on by default (animateRows) and instant with reduced motion. For any other list, AnimatedList and AnimatedListItem do the same on insert, remove and reorder."
      variant="bare"
      controls={<Switch checked={animate} onCheckedChange={setAnimate} label="Animate rows" />}
      code={`
import { useState } from "react";
import { AnimatedList, AnimatedListItem, DataTable, type DataTableColumn } from "@sheenui/theme";

type Invoice = { id: string; customer: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1001", customer: "Acme Corp", amount: 1280 },
  { id: "INV-1002", customer: "Globex", amount: 640 },
  { id: "INV-1003", customer: "Initech", amount: 2210 },
];

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice" },
  { id: "customer", header: "Customer" },
  { id: "amount", header: "Amount", numeric: true },
];

export function Example() {
  const [names, setNames] = useState(invoices.map((invoice) => invoice.customer));
  return (
    <>
      <DataTable caption="Invoices" data={invoices} columns={columns} animateRows hidePagination />
      <button type="button" onClick={() => setNames((list) => [...list].reverse())}>
        Reverse
      </button>
      <AnimatedList>
        {names.map((name) => (
          <AnimatedListItem key={name}>{name}</AnimatedListItem>
        ))}
      </AnimatedList>
    </>
  );
}`}
    >
      <AnimatedSortPreviewLazy animate={animate} />
    </Example>
  );
}
