import { useCallback, useState, type ReactNode } from "react";
import {
  Button,
  CurrencyCell,
  ProgressCell,
  RelativeDateCell,
  StatusCell,
  Switch,
  UserCell,
  formatCurrency,
  useToast,
  type DataTableColumn,
  type DataTableFilterOption,
} from "@sheenui/theme";
import { DataTable } from "../../layout/lazy-data-table";
import { Example } from "../../layout/Example";
import { DEMO_LOCALE, DEMO_NOW_MS } from "../../demo-clock";

/* ---------- Deterministic demo data (same 312 users on every load) ---------- */

type Role = "Owner" | "Admin" | "Editor" | "Viewer" | "Billing";

type Status = "active" | "trial" | "past_due" | "churned" | "invited";

type Plan = "Free" | "Starter" | "Pro" | "Enterprise";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  plan: Plan;
  mrr: number;
  signedUp: string;
  usage: number;
  country: string;
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Ravi",
  "Asha",
  "Meera",
  "Kabir",
  "Sara",
  "John",
  "Priya",
  "Arjun",
  "Neha",
  "Vikram",
  "Ananya",
  "Ada",
  "Isha",
  "Rohan",
  "Tara",
  "Dev",
  "Zoya",
  "Omar",
  "Lena",
  "Mateo",
  "Yuki",
  "Chloe",
  "Noah",
  "Amara",
];

const LAST = [
  "Kumar",
  "Verma",
  "Iyer",
  "Shah",
  "Khan",
  "Doe",
  "Nair",
  "Mehta",
  "Gupta",
  "Rao",
  "Das",
  "Rathore",
  "Kapoor",
  "Singh",
  "Bose",
  "Fischer",
  "Tanaka",
  "Okafor",
  "Silva",
  "Martin",
];

const COUNTRIES = ["India", "United States", "Germany", "Japan", "Brazil", "United Kingdom", "Singapore", "Nigeria"];

const ROLES: Role[] = ["Owner", "Admin", "Editor", "Editor", "Viewer", "Viewer", "Viewer", "Billing"];

const STATUSES: Status[] = ["active", "active", "active", "active", "trial", "trial", "past_due", "churned", "invited"];

const PLANS: Plan[] = ["Free", "Starter", "Starter", "Pro", "Pro", "Enterprise"];

const PLAN_PRICE: Record<Plan, number> = { Free: 0, Starter: 29, Pro: 99, Enterprise: 499 };

const DAY = 24 * 3600 * 1000;

const TODAY = DEMO_NOW_MS;

function makeUsers(count: number): User[] {
  const rand = mulberry32(42);
  const pick = <T,>(list: readonly T[]): T => {
    const value = list[Math.floor(rand() * list.length)];
    if (value === undefined) throw new Error("pick: the list is empty");
    return value;
  };
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const plan = pick(PLANS);
    const status = plan === "Free" && rand() > 0.5 ? "trial" : pick(STATUSES);
    const seats = 1 + Math.floor(rand() * 12);
    return {
      id: `usr_${(1000 + i).toString(36)}`,
      name: `${first} ${last}`,
      email:
        `${first}.${last}${i % 7 === 0 ? i : ""}@${pick(["example.com", "example.com", "example.com", "example.com"])}`.toLowerCase(),
      role: pick(ROLES),
      status,
      plan,
      mrr: status === "churned" || status === "invited" ? 0 : PLAN_PRICE[plan] * seats,
      signedUp: new Date(TODAY - Math.floor(rand() * 900) * DAY - Math.floor(rand() * 20) * 3600 * 1000).toISOString(),
      usage: Math.round(rand() * 100),
      country: pick(COUNTRIES),
    };
  });
}

export const USERS = makeUsers(312);

// The first user gets a stable name for the docs ("Select row Ravi Kumar").
const firstUser = USERS[0];

if (firstUser) USERS[0] = { ...firstUser, name: "Ravi Kumar", email: "ravi.kumar@example.com" };

export const statusLabel: Record<Status, string> = {
  active: "Active",
  trial: "Trial",
  past_due: "Past due",
  churned: "Churned",
  invited: "Invited",
};

export const statusOptions: DataTableFilterOption[] = (Object.keys(statusLabel) as Status[]).map((s) => ({
  value: s,
  label: statusLabel[s],
}));

export const roleOptions: DataTableFilterOption[] = ["Owner", "Admin", "Editor", "Viewer", "Billing"].map((r) => ({
  value: r,
  label: r,
}));

const planOptions: DataTableFilterOption[] = ["Free", "Starter", "Pro", "Enterprise"].map((p) => ({
  value: p,
  label: p,
}));

const userColumns: DataTableColumn<User>[] = [
  {
    id: "name",
    header: "User",
    minWidth: 240,
    searchValue: (u) => `${u.name} ${u.email}`,
    cell: ({ row, highlight }) => <UserCell name={row.name} email={row.email} highlight={highlight} />,
    exportValue: (u) => u.name,
  },
  { id: "email", header: "Email", defaultHidden: true },
  { id: "role", header: "Role", filter: "faceted", filterOptions: roleOptions },
  {
    id: "status",
    header: "Status",
    filter: "faceted",
    filterOptions: statusOptions,
    searchValue: (u) => statusLabel[u.status],
    exportValue: (u) => statusLabel[u.status],
    cell: ({ row, highlight }) => (
      <StatusCell
        value={row.status}
        label={highlight(statusLabel[row.status])}
        tones={{ active: "success", trial: "accent", past_due: "warning", churned: "danger", invited: "neutral" }}
      />
    ),
  },
  { id: "plan", header: "Plan", filter: "faceted", filterOptions: planOptions },
  {
    id: "mrr",
    header: "MRR",
    numeric: true,
    searchable: false,
    cell: ({ row }) => <CurrencyCell value={row.mrr} locale="en-US" />,
  },
  {
    id: "signedUp",
    header: "Signed up",
    searchable: false,
    sortFn: "datetime",
    accessorFn: (u) => new Date(u.signedUp),
    cell: ({ row }) => <RelativeDateCell value={row.signedUp} now={TODAY} locale={DEMO_LOCALE} />,
    exportValue: (u) => u.signedUp.slice(0, 10),
  },
  {
    id: "usage",
    header: "Usage",
    numeric: true,
    // The bar starts at the left, so the header does too.
    align: "left",
    minWidth: 180,
    searchable: false,
    cell: ({ row }) => <ProgressCell value={row.usage} label={`Usage for ${row.name}`} />,
    exportValue: (u) => u.usage,
  },
  { id: "country", header: "Country", defaultHidden: true },
];

/* ---------- Icons for the examples ---------- */

const icon = (d: string) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const EyeIcon = icon("M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z");

const EditIcon = icon("M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4");

const TrashIcon = icon("M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13");

const MailIcon = icon("M4 6h16v12H4zM4 7l8 6 8-6");

/* ---------- (a) Full-featured, client-side ---------- */

function UserDetails({ user }: { user: User }) {
  return (
    <div className="grid gap-4 text-sm sm:grid-cols-[repeat(4,minmax(0,1fr))_auto] sm:items-center">
      <Detail label="User id" value={<code className="font-sheen-mono text-xs">{user.id}</code>} />
      <Detail label="Country" value={user.country} />
      <Detail
        label="Signed up"
        value={new Date(user.signedUp).toLocaleDateString(DEMO_LOCALE, { dateStyle: "long" })}
      />
      <Detail
        label="Annual value"
        value={<span className="tabular-nums">{formatCurrency(user.mrr * 12, "USD", "en-US")}</span>}
      />
      <div className="flex gap-2">
        <Button variant="glass" size="sm" leading={MailIcon}>
          Email {user.name.split(" ")[0]}
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-sheen-fg-muted">{label}</span>
      <span className="font-medium text-sheen-fg">{value}</span>
    </div>
  );
}

export function FullExample() {
  const toast = useToast();
  const [users, setUsers] = useState(USERS);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [empty, setEmpty] = useState(false);

  const remove = useCallback((ids: Set<string>) => setUsers((list) => list.filter((u) => !ids.has(u.id))), []);

  return (
    <Example
      title="Full-featured (client-side)"
      description="312 generated users. Search highlights matches, filters show counts, shift-click headers to sort by several columns, shift-click checkboxes to select a range. Selection survives paging. Under 640px the rows become cards."
      variant="bare"
      controls={
        <>
          <Switch checked={loading} onCheckedChange={setLoading} label="Loading" />
          <Switch checked={failed} onCheckedChange={setFailed} label="Error" />
          <Switch checked={empty} onCheckedChange={setEmpty} label="No data" />
          <Button variant="ghost" size="sm" onClick={() => setUsers(USERS)} disabled={users.length === USERS.length}>
            Restore deleted rows
          </Button>
        </>
      }
      code={`
import {
  CurrencyCell,
  DataTable,
  type DataTableColumn,
  ProgressCell,
  RelativeDateCell,
  StatusCell,
  UserCell,
  type DataTableFilterOption,
} from "@sheenui/theme";
import { Pencil as EditIcon, Eye as EyeIcon, Trash2 as TrashIcon } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer" | "Billing";
  status: "active" | "trial" | "past_due" | "churned" | "invited";
  mrr: number;
  signedUp: string; // ISO date
  usage: number; // 0 to 100
  country: string;
};

// Your data: rows from an API or a store (a few inline here so the example runs as pasted).
const users: User[] = [
  { id: "u1", name: "Ravi Kumar", email: "ravi@example.com", role: "Owner", status: "active", mrr: 240, signedUp: "2025-01-14", usage: 82, country: "IN" },
  { id: "u2", name: "Asha Patel", email: "asha@example.com", role: "Admin", status: "trial", mrr: 0, signedUp: "2025-06-02", usage: 35, country: "GB" },
  { id: "u3", name: "Meera Shah", email: "meera@example.com", role: "Editor", status: "past_due", mrr: 90, signedUp: "2024-11-23", usage: 58, country: "US" },
  { id: "u4", name: "Kabir Rao", email: "kabir@example.com", role: "Viewer", status: "invited", mrr: 0, signedUp: "2025-08-30", usage: 4, country: "DE" },
];

const roleOptions: DataTableFilterOption[] = ["Owner", "Admin", "Editor", "Viewer", "Billing"].map((role) => ({ value: role, label: role }));
const statusOptions: DataTableFilterOption[] = ["active", "trial", "past_due", "churned", "invited"].map((status) => ({ value: status, label: status }));

export function Example() {
  const columns: DataTableColumn<User>[] = [
    {
      id: "name", header: "User", minWidth: 240,
      searchValue: (u) => \`\${u.name} \${u.email}\`,
      cell: ({ row, highlight }) => <UserCell name={row.name} email={row.email} highlight={highlight} />,
    },
    { id: "role", header: "Role", filter: "faceted", filterOptions: roleOptions },
    {
      id: "status", header: "Status", filter: "faceted", filterOptions: statusOptions,
      cell: ({ row }) => <StatusCell value={row.status} tones={{ active: "success", churned: "danger" }} />,
    },
    { id: "mrr", header: "MRR", numeric: true, cell: ({ row }) => <CurrencyCell value={row.mrr} locale="en-US" /> },
    { id: "signedUp", header: "Signed up", sortFn: "datetime", cell: ({ row }) => <RelativeDateCell value={row.signedUp} now={Date.now()} locale="en-US" /> },
    { id: "usage", header: "Usage", numeric: true, cell: ({ row }) => <ProgressCell value={row.usage} label="Usage" /> },
    { id: "country", header: "Country", defaultHidden: true },
  ];

  return (
    <DataTable
      caption="Workspace members"
      data={users}
      columns={columns}
      enableSelection
      mobileLayout="cards"
      maxHeight="36rem"
      rowActions={[
        { label: "View", icon: <EyeIcon />, onSelect: (u) => console.log("view", u.id) },
        { label: "Edit", icon: <EditIcon />, onSelect: (u) => console.log("edit", u.id) },
        { label: "Delete", icon: <TrashIcon />, tone: "danger", separatorBefore: true, onSelect: (u) => console.log("delete", u.id) },
      ]}
      bulkActions={[
        { label: "Delete", tone: "danger", icon: <TrashIcon />, onSelect: (rows, clear) => {
            console.log("delete", rows.length, "users");
            clear();
          } },
      ]}
      renderExpanded={(u) => (
        <p className="p-4 text-sm">
          {u.name} · {u.country} · {u.email}
        </p>
      )}
    />
  );
}`}
    >
      <DataTable
        caption="Workspace members"
        data={empty ? [] : users}
        columns={userColumns}
        getRowLabel={(u) => u.name}
        enableSelection
        mobileLayout="cards"
        maxHeight="36rem"
        exportFilename="members"
        loading={loading}
        error={failed ? "The members service timed out. Your filters are kept." : undefined}
        onRetry={() => {
          setFailed(false);
          toast.info("Retrying…");
        }}
        defaultSorting={[{ id: "signedUp", desc: true }]}
        rowActions={[
          { label: "View", icon: EyeIcon, onSelect: (u) => toast.info(`Viewing ${u.name}`) },
          { label: "Edit", icon: EditIcon, onSelect: (u) => toast.info(`Editing ${u.name}`) },
          {
            label: "Delete",
            icon: TrashIcon,
            tone: "danger",
            separatorBefore: true,
            onSelect: (u) => {
              remove(new Set([u.id]));
              toast.success(`Deleted ${u.name}`);
            },
          },
        ]}
        bulkActions={[
          {
            label: "Delete",
            icon: TrashIcon,
            tone: "danger",
            onSelect: (rows, clear) => {
              remove(new Set(rows.map((r) => r.id)));
              clear();
              toast.success(`Deleted ${rows.length} ${rows.length === 1 ? "user" : "users"}`);
            },
          },
        ]}
        renderExpanded={(u) => <UserDetails user={u} />}
      />
    </Example>
  );
}
