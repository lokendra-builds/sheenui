import { seeded } from "../../demo-utils";
import { startTransition, useState } from "react";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import {
  NetworkGraph,
  NetworkTable,
  networkLegend,
  type NetworkGroup,
  type NetworkLink,
  type NetworkNode,
} from "@sheenui/theme";
import { ChartCard, Headline } from "./shared";

/* ====================================================================== */
/* Network graph                                                          */
/* ====================================================================== */

export const serviceGroups: NetworkGroup[] = [
  { id: "edge", label: "Edge", color: 7 },
  { id: "core", label: "Core services", color: 1 },
  { id: "data", label: "Data stores", color: 3 },
  { id: "external", label: "Third party", color: 2 },
];

export const services: NetworkNode[] = [
  { id: "cdn", label: "CDN", group: "edge", value: 9 },
  { id: "gateway", label: "API gateway", group: "edge", value: 14 },
  { id: "web", label: "Web app", group: "edge", value: 8 },
  { id: "auth", label: "Auth", group: "core", value: 12 },
  { id: "users", label: "Users", group: "core", value: 9 },
  { id: "billing", label: "Billing", group: "core", value: 7 },
  { id: "orders", label: "Orders", group: "core", value: 11 },
  { id: "catalog", label: "Catalog", group: "core", value: 8 },
  { id: "search", label: "Search", group: "core", value: 7 },
  { id: "notify", label: "Notifications", group: "core", value: 5 },
  { id: "inventory", label: "Inventory", group: "core", value: 6 },
  { id: "shipping", label: "Shipping", group: "core", value: 5 },
  { id: "pg", label: "Postgres", group: "data", value: 13 },
  { id: "redis", label: "Redis", group: "data", value: 8 },
  { id: "elastic", label: "Elasticsearch", group: "data", value: 6 },
  { id: "kafka", label: "Kafka", group: "data", value: 10 },
  { id: "s3", label: "Object store", group: "data", value: 5 },
  { id: "payments-api", label: "Payments API", group: "external", value: 4 },
  { id: "sms-gateway", label: "SMS gateway", group: "external", value: 3 },
  { id: "carrier", label: "Carrier API", group: "external", value: 3 },
];

export const serviceLinks: NetworkLink[] = [
  ["cdn", "web"],
  ["web", "gateway"],
  ["gateway", "auth"],
  ["gateway", "users"],
  ["gateway", "orders"],
  ["gateway", "catalog"],
  ["gateway", "search"],
  ["auth", "users"],
  ["auth", "redis"],
  ["users", "pg"],
  ["billing", "pg"],
  ["billing", "payments-api"],
  ["orders", "billing"],
  ["orders", "inventory"],
  ["orders", "pg"],
  ["orders", "kafka"],
  ["orders", "shipping"],
  ["catalog", "pg"],
  ["catalog", "s3"],
  ["catalog", "kafka"],
  ["search", "elastic"],
  ["kafka", "search"],
  ["kafka", "notify"],
  ["notify", "sms-gateway"],
  ["inventory", "pg"],
  ["inventory", "kafka"],
  ["shipping", "carrier"],
  ["shipping", "kafka"],
  ["users", "notify"],
  ["cdn", "s3"],
].map(([source = "", target = ""]) => ({ source, target }));

const people = [
  "Ada",
  "Ben",
  "Cleo",
  "Dev",
  "Eli",
  "Fay",
  "Gus",
  "Hana",
  "Ivo",
  "Jun",
  "Kai",
  "Lea",
  "Mo",
  "Nia",
  "Oz",
  "Pia",
  "Quin",
  "Rae",
  "Sol",
  "Tia",
  "Uma",
  "Vik",
  "Wes",
  "Xia",
  "Yan",
  "Zoe",
  "Abe",
  "Bea",
  "Cal",
  "Dot",
  "Ed",
  "Flo",
  "Gia",
  "Hal",
  "Ida",
  "Jay",
  "Kim",
  "Lu",
  "Max",
  "Ned",
];

export const crewGroups: NetworkGroup[] = [
  { id: "product", label: "Product", color: 1 },
  { id: "design", label: "Design", color: 5 },
  { id: "eng", label: "Engineering", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "ops", label: "Operations", color: 7 },
];

export const crew = (() => {
  const rand = seeded(7);
  const nodes: NetworkNode[] = people.map((name, i) => ({
    id: name,
    group: crewGroups[i % crewGroups.length]?.id ?? "",
  }));
  const links: NetworkLink[] = [];
  const has = new Set<string>();
  const add = (a: number, b: number, value: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || has.has(key)) return;
    has.add(key);
    links.push({ source: people[a] ?? "", target: people[b] ?? "", value });
  };
  for (let i = 0; i < people.length; i++) {
    // Two or three ties inside the team, sometimes one across.
    for (let k = 0; k < 2 + Math.floor(rand() * 2); k++)
      add(i, (i + crewGroups.length * (1 + Math.floor(rand() * 4))) % people.length, 1 + Math.floor(rand() * 9));
    if (rand() < 0.45) add(i, Math.floor(rand() * people.length), 1 + Math.floor(rand() * 4));
  }
  return { nodes, links };
})();

const servicesNoSearch = services.filter((n) => n.id !== "search" && n.id !== "elastic");

const serviceLinksNoSearch = serviceLinks.filter(
  (l) => !["search", "elastic"].includes(l.source) && !["search", "elastic"].includes(l.target),
);

export function ServiceMapExample() {
  const [withSearch, setWithSearch] = useState(true);
  const nodes = withSearch ? services : servicesNoSearch;
  const links = withSearch ? serviceLinks : serviceLinksNoSearch;
  return (
    <Example
      title="Service dependency map"
      description="Hover a service to light up what it talks to; drag it and the rest of the graph follows, then settles. Ctrl or ⌘ + scroll, a pinch or the buttons zoom; drag the background to pan. Remove the search services: the rest glide to their new places. Node size is the service's traffic."
      variant="bare"
      controls={
        <Segmented
          label="Services"
          size="sm"
          options={[
            { value: "all", label: "All services" },
            { value: "nosearch", label: "Without search" },
          ]}
          value={withSearch ? "all" : "nosearch"}
          // A data switch re-renders the whole chart: as a transition, React renders it in slices (the click never blocks).
          onValueChange={(v) => startTransition(() => setWithSearch(v === "all"))}
        />
      }
      code={`
import { ChartCard, networkLegend, NetworkTable, NetworkGraph, type NetworkGroup, type NetworkNode, type NetworkLink } from "@sheenui/theme";

const groups: NetworkGroup[] = [
  { id: "edge", label: "Edge", color: 7 },
  { id: "core", label: "Core services", color: 1 },
  { id: "data", label: "Data stores", color: 3 },
  { id: "external", label: "Third party", color: 2 },
];
const nodes: NetworkNode[] = [
  { id: "gateway", label: "API gateway", group: "edge", value: 14 },
  { id: "auth", label: "Auth", group: "core", value: 12 },
  { id: "pg", label: "Postgres", group: "data", value: 13 },
  // ...
];
const links: NetworkLink[] = [
  { source: "gateway", target: "auth" },
  { source: "auth", target: "redis" },
  // ...
];

<ChartCard
  title="Service dependencies"
  legend={networkLegend(groups)}
  table={<NetworkTable nodes={nodes} links={links} groups={groups} caption="Every service and what it calls" />}
>
  <NetworkGraph nodes={nodes} links={links} groups={groups} aria-label="Dependencies between production services" />
</ChartCard>`}
    >
      <ChartCard
        className="w-full"
        title="Service dependencies"
        description="Production, calls in the last hour"
        aside={<Headline value={links.length} label="dependencies" />}
        legend={networkLegend(serviceGroups)}
        table={
          <NetworkTable nodes={nodes} links={links} groups={serviceGroups} caption="Every service and what it calls" />
        }
      >
        <NetworkGraph
          nodes={nodes}
          links={links}
          groups={serviceGroups}
          aria-label="Dependencies between production services"
        />
      </ChartCard>
    </Example>
  );
}
