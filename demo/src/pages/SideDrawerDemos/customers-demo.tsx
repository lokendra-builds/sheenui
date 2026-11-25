import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  Input,
  Select,
  foldText,
  formatCurrency,
  type DataTableSorting,
  type SelectItem,
} from "@sheenui/theme";
import { useSideDrawer, useSideDrawerCloseGuard } from "@sheenui/theme";
import { SideDrawerForm } from "@sheenui/theme";
import { SideDrawerDetail, type SideDrawerDetailMode } from "@sheenui/theme";
import { DescriptionItem, DescriptionList } from "@sheenui/theme";
import { useConfirm } from "@sheenui/theme";
import { MenuItem, MenuSeparator } from "@sheenui/theme";
import { Textarea } from "@sheenui/theme";
import { Timeline, TimelineItem } from "@sheenui/theme";
import { EMAIL, Icon, type Note, icons, wait } from "./shared";

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed locale and UTC: the demo data are UTC instants, and the page is prerendered, so the text must not depend on the viewer's zone.
export const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

const listFormat = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" });

/* =====================================================================
 * (c) Data table → details, walk the rows with J / K
 * ===================================================================== */

export type Plan = "Free" | "Starter" | "Pro" | "Enterprise";

export type CustomerStatus = "active" | "trial" | "past_due" | "churned";

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: Plan;
  status: CustomerStatus;
  mrr: number;
  seats: number;
  country: string;
  owner: string;
  phone: string;
  signedUp: string;
};

const FIRST = [
  "Ada",
  "Grace",
  "Alan",
  "Katherine",
  "Linus",
  "Margaret",
  "Radia",
  "Barbara",
  "Ken",
  "Frances",
  "Guido",
  "Hedy",
  "Sophie",
  "Anders",
  "Zoë",
  "Søren",
  "José",
  "Priya",
  "Aiko",
  "Mateo",
];

const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Johnson",
  "Torvalds",
  "Hamilton",
  "Perlman",
  "Liskov",
  "Thompson",
  "Allen",
  "Rossum",
  "Lamarr",
  "Wilson",
  "Hejlsberg",
  "Kowalski",
  "Kierkegaard",
  "Valim",
  "Raman",
  "Tanaka",
  "García",
];

const COMPANIES = [
  "Acme",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Soylent",
  "Vandelay",
  "Wayne Labs",
  "Stark Ind.",
  "Pied Piper",
];

const COUNTRIES = ["India", "United Kingdom", "United States", "Japan", "Germany", "Brazil", "Denmark", "Spain"];

const OWNERS = ["Ravi Kumar", "Meera Iyer", "Tom Becker", "Lena Fischer"];

const PLANS: Plan[] = ["Free", "Starter", "Pro", "Pro", "Enterprise"];

export const PLAN_PRICE: Record<Plan, number> = { Free: 0, Starter: 12, Pro: 29, Enterprise: 79 };

export const CUSTOMER_STATUS: Record<
  CustomerStatus,
  { label: string; tone: "success" | "accent" | "warning" | "danger" }
> = {
  active: { label: "Active", tone: "success" },
  trial: { label: "Trial", tone: "accent" },
  past_due: { label: "Past due", tone: "warning" },
  churned: { label: "Churned", tone: "danger" },
};

const PLAN_ITEMS: SelectItem[] = (["Free", "Starter", "Pro", "Enterprise"] as Plan[]).map((value) => ({
  value,
  label: value,
  description: `$${PLAN_PRICE[value]} per seat`,
}));

const CUSTOMER_STATUS_ITEMS: SelectItem[] = (Object.keys(CUSTOMER_STATUS) as CustomerStatus[]).map((value) => ({
  value,
  label: CUSTOMER_STATUS[value].label,
}));

function makeCustomers(count: number): Customer[] {
  const rand = mulberry32(1042);
  const pick = <T,>(list: readonly T[]): T => {
    const value = list[Math.floor(rand() * list.length)];
    if (value === undefined) throw new Error("pick: the list is empty");
    return value;
  };
  const at = <T,>(list: readonly T[], i: number): T => {
    const value = list[i];
    if (value === undefined) throw new Error("at: index out of range");
    return value;
  };
  return Array.from({ length: count }, (_, i) => {
    const first = at(FIRST, i % FIRST.length);
    const last = at(LAST, (i * 7 + 3) % LAST.length);
    const plan = pick(PLANS);
    const status: CustomerStatus =
      plan === "Free" ? "trial" : rand() > 0.82 ? "past_due" : rand() > 0.9 ? "churned" : "active";
    const seats = 1 + Math.floor(rand() * 24);
    const company = pick(COMPANIES);
    return {
      id: `cus_${(48213 + i * 37).toString(36).toUpperCase()}`,
      name: `${first} ${last}`,
      email: `${foldText(first)}.${foldText(last)}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      company,
      plan,
      status,
      mrr: status === "churned" ? 0 : PLAN_PRICE[plan] * seats,
      seats,
      country: pick(COUNTRIES),
      owner: pick(OWNERS),
      phone: rand() > 0.35 ? `+44 20 7946 ${String(1000 + Math.floor(rand() * 8999))}` : "",
      signedUp: new Date(Date.UTC(2024, 0, 1) + Math.floor(rand() * 900) * 86400000).toISOString(),
    };
  });
}

export const CUSTOMERS = makeCustomers(40);

/** The 7th row fails to load once, to show the error state (Retry works). */
const FLAKY_ID = CUSTOMERS[6]?.id ?? "";

type CustomerDetails = {
  events: {
    id: string;
    title: ReactNode;
    time: string;
    tone: "neutral" | "accent" | "success" | "warning";
    icon: string;
  }[];
};

function makeDetails(customer: Customer): CustomerDetails {
  const rand = mulberry32(customer.id.length * 97 + customer.seats * 13 + customer.name.charCodeAt(0));
  const day = (n: number) => dateFormat.format(new Date(Date.parse(customer.signedUp) + n * 86400000));
  const events: CustomerDetails["events"] = [
    {
      id: "signup",
      title: (
        <>
          <b>{customer.name}</b> signed up
        </>
      ),
      time: day(0),
      tone: "neutral",
      icon: icons.user,
    },
    {
      id: "plan",
      title: (
        <>
          Started the <b>{customer.plan}</b> plan
        </>
      ),
      time: day(2 + Math.floor(rand() * 10)),
      tone: "accent",
      icon: icons.spark,
    },
    {
      id: "seats",
      title: (
        <>
          Grew to <b>{customer.seats}</b> seats
        </>
      ),
      time: day(40 + Math.floor(rand() * 200)),
      tone: "success",
      icon: icons.check,
    },
  ];
  if (customer.status === "past_due")
    events.push({
      id: "due",
      title: "Payment failed, retrying in 3 days",
      time: day(300),
      tone: "warning",
      icon: icons.card,
    });
  return { events: events.reverse() };
}

/** Pretend API: each record "loads" for a moment, and is cached afterwards. */
function useCustomerDetails(customer: Customer | null) {
  const [results, setResults] = useState<Partial<Record<string, CustomerDetails | "error">>>({});
  const failedOnce = useRef(new Set<string>());
  const id = customer?.id;
  const result = id ? results[id] : undefined;

  useEffect(() => {
    if (!customer || results[customer.id] !== undefined) return;
    const timer = window.setTimeout(() => {
      const fail = customer.id === FLAKY_ID && !failedOnce.current.has(customer.id);
      if (fail) failedOnce.current.add(customer.id);
      setResults((all) => ({ ...all, [customer.id]: fail ? "error" : makeDetails(customer) }));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [customer, results]);

  const retry = useCallback(() => {
    if (!id) return;
    setResults((all) => Object.fromEntries(Object.entries(all).filter(([key]) => key !== id)));
  }, [id]);

  return {
    status: result === undefined ? "loading" : result === "error" ? "error" : "ready",
    details: typeof result === "object" ? result : undefined,
    retry,
  } as const;
}

/** The same search + sort the table applies, so previous / next walks the rows in the order you see them. */
export function orderCustomers(list: Customer[], query: string, sorting: DataTableSorting) {
  const q = foldText(query.trim());
  const filtered = q
    ? list.filter((c) =>
        [`${c.name} ${c.email}`, c.company, c.plan, CUSTOMER_STATUS[c.status].label].some((text) =>
          foldText(text).includes(q),
        ),
      )
    : list;
  if (sorting.length === 0) return filtered;
  const value = (c: Customer, id: string): string | number =>
    id === "name"
      ? c.name
      : id === "status"
        ? CUSTOMER_STATUS[c.status].label
        : id === "signedUp"
          ? Date.parse(c.signedUp)
          : ((c as Record<string, unknown>)[id] as string | number);
  return [...filtered].sort((a, b) => {
    for (const { id, desc } of sorting) {
      const x = value(a, id);
      const y = value(b, id);
      const order = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      if (order !== 0) return desc ? -order : order;
    }
    return 0;
  });
}

export type CustomerEdit = { name: string; email: string; plan: string; status: string; seats: string };

/** The name button that opens a customer (focus goes back to it when the drawer closes). */
export const customerButton = (id: string | null) =>
  id ? document.querySelector<HTMLElement>(`[data-customer-id="${CSS.escape(id)}"]`) : null;

export function CustomerDrawer({
  customer,
  index,
  count,
  onIndexChange,
  mode,
  onModeChange,
  notes,
  onAddNote,
  draft,
  onDraftChange,
  unsentNotes,
  onDiscardNotes,
  onSave,
  onDelete,
}: {
  customer: Customer;
  index: number;
  count: number;
  onIndexChange: (index: number) => void;
  mode: SideDrawerDetailMode;
  onModeChange: (mode: SideDrawerDetailMode) => void;
  notes: Note[];
  onAddNote: (note: Note) => void;
  /** This customer's half-written note (kept per customer while you move between rows). */
  draft: string;
  onDraftChange: (text: string) => void;
  /** Names of the customers with a half-written note. */
  unsentNotes: string[];
  onDiscardNotes: () => void;
  onSave: (values: CustomerEdit) => void;
  onDelete: () => void;
}) {
  const { status, details, retry } = useCustomerDetails(customer);
  const drawer = useSideDrawer();
  const [confirm, confirmDialog] = useConfirm();
  const state = CUSTOMER_STATUS[customer.status];

  // Half-written notes survive J / K, but closing the drawer asks first (like the order example),
  // naming whose note it is: it may not be the customer on screen.
  useSideDrawerCloseGuard(() =>
    unsentNotes.length > 0
      ? confirm({
          tone: "warning",
          title: unsentNotes.length === 1 ? "Discard your note?" : `Discard ${unsentNotes.length} unsent notes?`,
          description:
            unsentNotes.length === 1
              ? `Your note on ${unsentNotes[0]} hasn’t been added yet.`
              : `Your notes on ${listFormat.format(unsentNotes)} haven’t been added yet.`,
          confirmLabel: unsentNotes.length === 1 ? "Discard note" : "Discard notes",
          cancelLabel: "Keep writing",
        }).then((ok) => {
          if (ok) onDiscardNotes();
          return ok;
        })
      : true,
  );

  async function remove() {
    const ok = await confirm({
      title: `Delete ${customer.name}?`,
      description: "Their workspace, invoices and notes are deleted. This can’t be undone.",
      confirmLabel: "Delete customer",
      confirmationText: customer.name.split(" ")[0],
      onConfirm: () => wait(600),
    });
    if (ok) onDelete();
  }

  return (
    <>
      <SideDrawerDetail
        recordKey={customer.id}
        avatar={<Avatar name={customer.name} />}
        title={customer.name}
        status={
          <Badge tone={state.tone} dot>
            {state.label}
          </Badge>
        }
        subtitle={customer.email}
        recordId={customer.id}
        recordIdLabel="Customer ID"
        loading={status === "loading"}
        error={status === "error" ? "The server took too long to answer. This row fails once on purpose." : undefined}
        onRetry={retry}
        navigation={{ index, count, onIndexChange, labels: { previous: "Previous customer", next: "Next customer" } }}
        mode={mode}
        onModeChange={onModeChange}
        menu={
          <>
            <MenuItem
              icon={<Icon d={icons.copy} />}
              onClick={() => drawer?.notify("Duplicated", { announce: `Duplicated ${customer.name}` })}
            >
              Duplicate
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
              <DescriptionList>
                <DescriptionItem label="Company">{customer.company}</DescriptionItem>
                <DescriptionItem label="Plan">
                  <Badge tone="accent">{customer.plan}</Badge>
                </DescriptionItem>
                <DescriptionItem
                  label="MRR"
                  hint={`${customer.seats} ${customer.seats === 1 ? "seat" : "seats"} × $${PLAN_PRICE[customer.plan]}`}
                >
                  <span className="tabular-nums">{formatCurrency(customer.mrr, "USD", "en-US")}</span>
                </DescriptionItem>
                <DescriptionItem label="Email" copyValue={customer.email}>
                  <span dir="ltr">{customer.email}</span>
                </DescriptionItem>
                <DescriptionItem label="Phone" copyValue={customer.phone || undefined}>
                  {customer.phone && <span dir="ltr">{customer.phone}</span>}
                </DescriptionItem>
                <DescriptionItem label="Country">{customer.country}</DescriptionItem>
                <DescriptionItem label="Account owner">{customer.owner}</DescriptionItem>
                <DescriptionItem label="Signed up">{dateFormat.format(new Date(customer.signedUp))}</DescriptionItem>
              </DescriptionList>
            ),
          },
          {
            value: "activity",
            label: "Activity",
            content: details && (
              <Timeline aria-label={`${customer.name} activity`} size="sm">
                {details.events.map((event, i) => (
                  <TimelineItem
                    key={event.id}
                    icon={<Icon d={event.icon} />}
                    tone={event.tone}
                    title={event.title}
                    time={event.time}
                    current={i === 0 && event.tone === "warning"}
                  />
                ))}
              </Timeline>
            ),
          },
          {
            value: "notes",
            label: "Notes",
            count: notes.length,
            content: (
              <div className="flex flex-col gap-4">
                <Textarea
                  label="Add a note"
                  description="A draft stays with this customer while you move between rows."
                  maxLength={280}
                  minRows={2}
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                />
                <Button
                  size="sm"
                  variant="glass"
                  className="self-end"
                  disabled={!draft.trim()}
                  onClick={() => {
                    onAddNote({
                      id: crypto.randomUUID(),
                      author: "Ada Lovelace",
                      text: draft.trim(),
                      at: new Date().toISOString(),
                    });
                    onDraftChange("");
                  }}
                >
                  Add note
                </Button>
                {notes.length === 0 ? (
                  <p className="text-sm text-sheen-fg-muted">No notes yet.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {notes.map((note) => (
                      <li
                        key={note.id}
                        className="rounded-sheen-md border border-sheen-border px-3.5 py-2.5 text-sm [overflow-wrap:anywhere]"
                      >
                        {note.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ),
          },
        ]}
        editor={
          <SideDrawerForm<CustomerEdit>
            key={customer.id}
            initialValues={{
              name: customer.name,
              email: customer.email,
              plan: customer.plan,
              status: customer.status,
              seats: String(customer.seats),
            }}
            validate={(v) => {
              const seats = Number(v.seats);
              return {
                name: v.name.trim() ? undefined : "Enter the customer’s name",
                email: EMAIL.test(v.email.trim()) ? undefined : "Enter an email address like name@example.com",
                seats:
                  Number.isInteger(seats) && seats >= 1 && seats <= 500
                    ? undefined
                    : "Seats must be a whole number from 1 to 500",
              };
            }}
            onSubmit={async (values) => {
              await wait(700);
              onSave(values);
            }}
            successToast="Customer updated"
          >
            {(form) => (
              <>
                <Input label="Name" autoComplete="off" {...form.field("name")} />
                <Input label="Email" type="email" autoComplete="off" {...form.field("email")} />
                <div className="grid gap-5 @md/side-drawer:grid-cols-2">
                  <Select
                    label="Plan"
                    name="plan"
                    items={PLAN_ITEMS}
                    value={form.values.plan}
                    onValueChange={(value) => form.setValue("plan", value ?? "Free")}
                  />
                  <Select
                    label="Status"
                    name="status"
                    items={CUSTOMER_STATUS_ITEMS}
                    value={form.values.status}
                    onValueChange={(value) => form.setValue("status", value ?? "active")}
                  />
                </div>
                <Input label="Seats" inputMode="numeric" {...form.field("seats")} />
              </>
            )}
          </SideDrawerForm>
        }
      />
      {confirmDialog}
    </>
  );
}
