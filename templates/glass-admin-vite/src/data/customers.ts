export type Plan = "Starter" | "Pro" | "Business" | "Enterprise";
export type Status = "Active" | "Trial" | "Past due" | "Churned";

export type Customer = {
  id: string;
  company: string;
  contact: string;
  email: string;
  plan: Plan;
  status: Status;
  mrr: number;
  seats: number;
  country: string;
  since: string;
};

/** Made-up companies and people; every address is on a subdomain of example.com. */
const COMPANIES = [
  "Northwind Labs", "Brightwave Studio", "Kestrel Freight", "Marigold Health", "Quartz Robotics", "Harbor & Pine",
  "Lumina Foods", "Tidepool Analytics", "Foxglove Media", "Summit Ridge Co", "Cobalt Logistics", "Juniper Works",
  "Meridian Trade", "Pelican Pay", "Orchard Systems", "Redwood Energy", "Saffron Kitchen", "Atlas Mobility",
  "Willow Education", "Ember Games", "Granite Legal", "Nimbus Cloud", "Velvet Textiles", "Zephyr Travel",
  "Copperleaf Bio", "Driftwood Design", "Halcyon Finance", "Ironbark Build", "Lanternfly Apps", "Mosaic Retail",
  "Nectar Drinks", "Opal Security", "Prairie Farms", "Quill & Co", "Riverstone Homes", "Sparrow Air",
  "Thistle Beauty", "Umber Coffee", "Vantage Telecom", "Wren Pharmacy", "Yarrow Outdoors", "Zinnia Events",
  "Alder Insurance", "Birch Bikes", "Cinder Audio", "Dune Solar", "Elm Street Bank", "Fable Books",
] as const;

const FIRST = ["Maya", "Jonas", "Priya", "Tomas", "Aisha", "Lena", "Mateo", "Noor", "Elif", "Kofi", "Ines", "Daniel"];
const LAST = ["Okafor", "Lindqvist", "Raman", "Novak", "Haddad", "Fischer", "Costa", "Aziz", "Demir", "Mensah", "Moreau", "Park"];
const PLANS: Plan[] = ["Starter", "Pro", "Pro", "Business", "Business", "Enterprise"];
const STATUSES: Status[] = ["Active", "Active", "Active", "Active", "Trial", "Past due", "Churned"];
const COUNTRIES = ["United States", "Germany", "India", "Brazil", "United Kingdom", "Japan", "Canada", "Spain"];
const MRR: Record<Plan, number> = { Starter: 49, Pro: 199, Business: 690, Enterprise: 2400 };

/** Same list on every render and every build (no Math.random). */
export const CUSTOMERS: Customer[] = COMPANIES.map((company, i) => {
  const plan = PLANS[(i * 5 + 1) % PLANS.length] ?? "Pro";
  const status = STATUSES[(i * 3 + 2) % STATUSES.length] ?? "Active";
  const first = FIRST[i % FIRST.length] ?? "Maya";
  const last = LAST[(i * 7) % LAST.length] ?? "Okafor";
  const month = ((i * 5) % 12) + 1;
  const day = ((i * 11) % 27) + 1;
  return {
    id: `cus_${String(1000 + i)}`,
    company,
    contact: `${first} ${last}`,
    email: `${first}.${last}@${company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example.com`.toLowerCase(),
    plan,
    status,
    mrr: status === "Trial" || status === "Churned" ? 0 : Math.round(MRR[plan] * (0.9 + ((i * 13) % 30) / 100)),
    seats: plan === "Enterprise" ? 120 + ((i * 17) % 200) : plan === "Business" ? 25 + ((i * 7) % 60) : 3 + ((i * 3) % 18),
    country: COUNTRIES[(i * 3) % COUNTRIES.length] ?? "United States",
    since: `${2023 + (i % 3)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
});
