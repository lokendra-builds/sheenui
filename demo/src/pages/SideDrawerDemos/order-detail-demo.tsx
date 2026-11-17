import { useState } from "react";
import { Avatar, Badge, Button, Input, Select, formatCurrency, useToast, type SelectItem } from "@sheenui/theme";
import { useSideDrawer, useSideDrawerCloseGuard } from "@sheenui/theme";
import { SideDrawerForm } from "@sheenui/theme";
import { SideDrawerDetail, type SideDrawerDetailMode } from "@sheenui/theme";
import { DescriptionItem, DescriptionList } from "@sheenui/theme";
import { useConfirm } from "@sheenui/theme";
import { MenuItem, MenuSeparator } from "@sheenui/theme";
import { Textarea } from "@sheenui/theme";
import { Timeline, TimelineItem } from "@sheenui/theme";
import { Icon, type Note, dateTimeFormat, icons, wait } from "./shared";

/* =====================================================================
 * (b) Order details: view ⇄ edit in the same drawer
 * ===================================================================== */

type OrderStatus = "pending" | "paid" | "shipped" | "refunded";

type Order = {
  id: string;
  number: string;
  customer: string;
  email: string;
  status: OrderStatus;
  method: string;
  address: string;
  reference: string;
  placedAt: string;
  items: { name: string; qty: number; price: number }[];
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: "warning" | "success" | "accent" | "neutral" }> =
  {
    pending: { label: "Pending", tone: "warning" },
    paid: { label: "Paid", tone: "success" },
    shipped: { label: "Shipped", tone: "accent" },
    refunded: { label: "Refunded", tone: "neutral" },
  };

const ORDER_STATUS_ITEMS: SelectItem[] = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((value) => ({
  value,
  label: ORDER_STATUS[value].label,
}));

export const INITIAL_ORDER: Order = {
  id: "ord_8Hk2QxV1aL",
  number: "1042",
  customer: "Grace Hopper",
  email: "grace@example.com",
  status: "paid",
  method: "Card •••• 4242",
  address: "Flat 4B, 221 Baker Street\nLondon NW1 6XE\nUnited Kingdom",
  reference: "PO-77812",
  placedAt: "2026-10-28T09:14:00Z",
  items: [
    { name: "Aurora desk lamp", qty: 1, price: 89 },
    { name: "Frosted glass coasters (set of 4)", qty: 2, price: 18 },
    { name: "Linen notebook", qty: 1, price: 14 },
  ],
};

export const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    author: "Ravi Kumar",
    text: "Customer asked for gift wrapping, added a note to the packing slip.",
    at: "2026-10-28T10:02:00Z",
  },
];

export const orderTotal = (order: Order) => order.items.reduce((sum, item) => sum + item.qty * item.price, 0);

type OrderEdit = { status: string; address: string; reference: string };

/** Lives inside the drawer, so it can guard the close (a half-written note) and host its dialogs. */
export function OrderDrawer({
  order,
  notes,
  mode,
  onModeChange,
  onSave,
  onAddNote,
  onDeleted,
}: {
  order: Order;
  notes: Note[];
  mode: SideDrawerDetailMode;
  onModeChange: (mode: SideDrawerDetailMode) => void;
  onSave: (order: Order) => void;
  onAddNote: (note: Note) => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const drawer = useSideDrawer();
  const [confirm, confirmDialog] = useConfirm();
  const [draft, setDraft] = useState("");
  const status = ORDER_STATUS[order.status];

  // A note that was typed but not added: ask before the drawer closes.
  useSideDrawerCloseGuard(() =>
    draft.trim()
      ? confirm({
          tone: "warning",
          title: "Discard your note?",
          description: "It hasn’t been added to the order yet.",
          confirmLabel: "Discard note",
          cancelLabel: "Keep writing",
        })
      : true,
  );

  async function remove() {
    const ok = await confirm({
      title: `Delete order #${order.number}?`,
      description: "The order and its history are removed for everyone. This can’t be undone.",
      confirmLabel: "Delete order",
      onConfirm: () => wait(700),
    });
    if (!ok) return;
    setDraft("");
    onDeleted();
    toast.success(`Order #${order.number} deleted`, "Demo only: it’s back next time you open it.");
  }

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    onAddNote({ id: crypto.randomUUID(), author: "Ada Lovelace", text, at: new Date().toISOString() });
    setDraft("");
  }

  return (
    <>
      <SideDrawerDetail
        avatar={<Avatar name={order.customer} />}
        title={`Order #${order.number}`}
        status={
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        }
        subtitle={order.customer}
        recordId={order.id}
        recordIdLabel="Order ID"
        mode={mode}
        onModeChange={onModeChange}
        menu={
          <>
            {/* The drawer stays open: confirm in place (a corner toast would sit on the panel's header). */}
            <MenuItem
              icon={<Icon d={icons.copy} />}
              onClick={() =>
                drawer?.notify(`Duplicated as #${Number(order.number) + 1}`, {
                  announce: `Order #${order.number} duplicated as order #${Number(order.number) + 1}`,
                })
              }
            >
              Duplicate
            </MenuItem>
            <MenuItem
              icon={<Icon d={icons.archive} />}
              onClick={() => drawer?.notify("Archived", { announce: `Order #${order.number} archived` })}
            >
              Archive
            </MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" icon={<Icon d={icons.trash} />} onClick={remove}>
              Delete…
            </MenuItem>
          </>
        }
        tabs={[
          {
            value: "overview",
            label: "Overview",
            content: (
              <div className="flex flex-col gap-6">
                <DescriptionList>
                  <DescriptionItem label="Customer">{order.customer}</DescriptionItem>
                  <DescriptionItem label="Email" copyValue={order.email}>
                    {order.email}
                  </DescriptionItem>
                  <DescriptionItem label="Payment">{order.method}</DescriptionItem>
                  <DescriptionItem label="Shipping address" copyValue={order.address}>
                    <span className="whitespace-pre-line">{order.address}</span>
                  </DescriptionItem>
                  <DescriptionItem label="Reference" copyValue={order.reference || undefined}>
                    {order.reference}
                  </DescriptionItem>
                  <DescriptionItem label="Placed">{dateTimeFormat.format(new Date(order.placedAt))}</DescriptionItem>
                </DescriptionList>
                <section aria-labelledby="order-items" className="flex flex-col gap-2">
                  <h3 id="order-items" className="text-sm font-semibold">
                    Items
                  </h3>
                  <ul className="flex flex-col divide-y divide-sheen-border rounded-sheen-lg border border-sheen-border">
                    {order.items.map((item) => (
                      <li key={item.name} className="flex items-baseline justify-between gap-4 px-3.5 py-2.5 text-sm">
                        <span className="min-w-0">
                          {item.name} <span className="text-sheen-fg-muted">× {item.qty}</span>
                        </span>
                        <span className="tabular-nums">{formatCurrency(item.qty * item.price, "USD", "en-US", 2)}</span>
                      </li>
                    ))}
                    <li className="flex items-baseline justify-between gap-4 px-3.5 py-2.5 text-sm font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{formatCurrency(orderTotal(order), "USD", "en-US", 2)}</span>
                    </li>
                  </ul>
                </section>
              </div>
            ),
          },
          {
            value: "activity",
            label: "Activity",
            count: 4,
            content: (
              <Timeline aria-label="Order activity" size="sm">
                <TimelineItem
                  icon={<Icon d={icons.truck} />}
                  tone="accent"
                  current
                  title="Out for delivery"
                  description="Royal Mail, tracking RM 2048 1932 GB"
                  time="Today"
                  connector="dashed"
                />
                <TimelineItem icon={<Icon d={icons.tag} />} title="Shipping label created" time="Oct 29" />
                <TimelineItem
                  icon={<Icon d={icons.card} />}
                  tone="success"
                  title={
                    <>
                      Payment of <b>{formatCurrency(orderTotal(order), "USD", "en-US", 2)}</b> captured
                    </>
                  }
                  time="Oct 28"
                />
                <TimelineItem
                  avatar={<Avatar name={order.customer} size="sm" />}
                  title={
                    <>
                      <b>{order.customer}</b> placed the order
                    </>
                  }
                  time="Oct 28"
                />
              </Timeline>
            ),
          },
          {
            value: "notes",
            label: "Notes",
            count: notes.length,
            content: (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Textarea
                    label="Add a note"
                    description="Only your team can see notes."
                    maxLength={280}
                    minRows={2}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <Button size="sm" variant="glass" onClick={addNote} disabled={!draft.trim()} className="self-end">
                    Add note
                  </Button>
                </div>
                <ul className="flex flex-col gap-3">
                  {notes.map((note) => (
                    <li key={note.id} className="flex gap-3">
                      <Avatar name={note.author} size="sm" />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-sm">
                          <b className="font-semibold">{note.author}</b>{" "}
                          <span className="text-xs text-sheen-fg-muted">
                            {dateTimeFormat.format(new Date(note.at))}
                          </span>
                        </p>
                        <p className="text-sm text-pretty [overflow-wrap:anywhere] text-sheen-fg-muted">{note.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
        ]}
        editor={
          <SideDrawerForm<OrderEdit>
            initialValues={{ status: order.status, address: order.address, reference: order.reference }}
            validate={(v) => ({ address: v.address.trim() ? undefined : "Enter a shipping address" })}
            onSubmit={async (values) => {
              await wait(800);
              onSave({
                ...order,
                status: values.status as OrderStatus,
                address: values.address.trim(),
                reference: values.reference.trim(),
              });
            }}
            successToast="Order updated"
          >
            {(form) => (
              <>
                <Select
                  label="Status"
                  name="status"
                  items={ORDER_STATUS_ITEMS}
                  value={form.values.status}
                  onValueChange={(value) => form.setValue("status", value ?? "pending")}
                />
                <Textarea label="Shipping address" minRows={3} {...form.field("address")} />
                <Input label="Customer reference" description="Shown on the invoice." {...form.field("reference")} />
              </>
            )}
          </SideDrawerForm>
        }
      />
      {confirmDialog}
    </>
  );
}
