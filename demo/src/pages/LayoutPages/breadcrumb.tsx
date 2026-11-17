import { useState } from "react";
import { Slider } from "@sheenui/theme";
import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";
import { DemoLink, I, demoHref, icon } from "./shared";

/* =====================================================================
 * Breadcrumb
 * ===================================================================== */

export const trail: BreadcrumbItem[] = [
  { label: "Home", href: demoHref("/"), icon: icon(I.home), iconOnly: true },
  { label: "Acme workspace", href: demoHref("/acme") },
  { label: "Engineering", href: demoHref("/acme/engineering") },
  { label: "Platform team", href: demoHref("/acme/engineering/platform") },
  { label: "Projects", href: demoHref("/acme/engineering/platform/projects") },
  { label: "Q3 roadmap", href: demoHref("/acme/engineering/platform/projects/q3") },
  { label: "Launch checklist" },
];

export const breadcrumbFitCode = `
import { Breadcrumb } from "@sheenui/theme";
import { House as HomeIcon } from "lucide-react";

export function Example() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/", icon: <HomeIcon />, iconOnly: true },
        { label: "Acme workspace", href: "/acme" },
        { label: "Engineering", href: "/acme/engineering" },
        { label: "Platform team", href: "/acme/engineering/platform" },
        { label: "Projects", href: "/acme/engineering/platform/projects" },
        { label: "Q3 roadmap", href: "/acme/engineering/platform/projects/q3" },
        { label: "Launch checklist" }, // the current page
      ]}
    />
  );
}`;

export const breadcrumbStylesCode = `
import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";

const items: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#projects" },
  { label: "SheenUI" },
];

const trail: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Acme", href: "#acme" },
  { label: "Engineering", href: "#engineering" },
  { label: "Platform", href: "#platform" },
  { label: "Billing service" },
];

export function Example() {
  // Several breadcrumbs on one page: give each nav its own name.
  return (
    <>
      <Breadcrumb variant="glass" items={items} labels={{ nav: "Breadcrumb (glass)" }} />
      <Breadcrumb separator="slash" items={items} labels={{ nav: "Breadcrumb (slash)" }} />
      <Breadcrumb separator="dot" size="sm" items={items} labels={{ nav: "Breadcrumb (dot)" }} />
      {/* maxItems always keeps the first item, a "…" menu and the last items */}
      <Breadcrumb maxItems={3} items={trail} labels={{ nav: "Breadcrumb (collapsed)" }} />
    </>
  );
}`;

export const breadcrumbRouterCode = `
import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";
import { Link } from "react-router";

const items: BreadcrumbItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Projets", href: "/projets" },
  { label: "SheenUI" },
];

export function Example() {
  // Every link (inline and inside the "…" menu) renders as your router's Link.

  return (
    <Breadcrumb
      items={items}
      renderLink={(item) => <Link to={item.href!} />}
      labels={{ nav: "Fil d'Ariane", more: (n) => \`Afficher \${n} pages masquées\` }}
    />
  );
}`;

export function BreadcrumbFitDemo() {
  const [width, setWidth] = useState(100);
  return (
    <div className="flex w-full flex-col gap-6">
      <Slider
        label="Container width"
        showValue
        min={30}
        max={100}
        step={1}
        value={width}
        onValueChange={(v) => setWidth(Array.isArray(v) ? (v[0] ?? 100) : v)}
        className="max-w-sm"
      />
      <div
        style={{ width: `${width}%` }}
        className="min-w-0 rounded-sheen-lg border border-dashed border-sheen-fg-subtle/40 px-3 py-2.5"
      >
        <Breadcrumb
          items={trail}
          renderLink={(item) => <DemoLink to={item.href ?? "#"} />}
          labels={{ nav: "Breadcrumb (resizable)" }}
        />
      </div>
    </div>
  );
}
