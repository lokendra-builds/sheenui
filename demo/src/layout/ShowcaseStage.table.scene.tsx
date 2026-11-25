import { useSyncExternalStore } from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { TableScene } from "./ShowcaseStage.table";

const INVOICES = [
  { id: "INV-204", amount: 1200 },
  { id: "INV-205", amount: 480 },
  { id: "INV-206", amount: 960 },
] as const;

/** Nothing changes after mount: the store only tells the server render from the client. */
const subscribeNothing = () => () => undefined;

/** The live Table on its stage: real table elements; the status cells settle one by one. */
export function TableScene({ scene }: { scene: TableScene; ctx: StageContext }) {
  // The prerendered HTML (and the hydrating render) show every invoice settled, so crawlers and readers without
  // JavaScript see the real total instead of "$0"; the story then plays from the scene's own start.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const paid = hydrated ? scene.paid : INVOICES.length;
  const received = INVOICES.slice(0, paid).reduce((sum, row) => sum + row.amount, 0);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Table regionLabel="Invoices table" className="w-full text-start">
        <TableCaption>Invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Invoice</TableHead>
            <TableHead scope="col" className="text-end">
              Amount
            </TableHead>
            <TableHead scope="col">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INVOICES.map((row, i) => (
            <TableRow key={row.id}>
              <TableHead scope="row">{row.id}</TableHead>
              <TableCell className="text-end">${row.amount}</TableCell>
              <TableCell>
                <Badge key={i < paid ? "paid" : "due"} tone={i < paid ? "success" : "warning"}>
                  {i < paid ? "Paid" : "Due"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableHead scope="row">Received</TableHead>
            <TableCell className="text-end">${received}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
