import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { BreadcrumbScene as BreadcrumbSceneData } from "../layout/ShowcaseStage.breadcrumb";
import { BreadcrumbScene } from "../layout/ShowcaseStage.breadcrumb.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { DemoLink, I, demoHref, icon } from "./LayoutPages/shared";
import {
  BreadcrumbFitDemo,
  breadcrumbFitCode,
  breadcrumbRouterCode,
  breadcrumbStylesCode,
  trail,
} from "./LayoutPages/breadcrumb";

/** The "Breadcrumb" docs page (/layout/breadcrumb): live examples, props and notes. */
export function BreadcrumbPage() {
  const short: BreadcrumbItem[] = [
    { label: "Home", href: demoHref("/"), icon: icon(I.home), iconOnly: true },
    { label: "Library", href: demoHref("/library"), icon: icon(I.folder) },
    { label: "Design systems", href: demoHref("/library/design-systems") },
    { label: "SheenUI" },
  ];
  const link = (item: BreadcrumbItem) => <DemoLink to={item.href ?? "#"} />;
  return (
    <Page
      eyebrow="Layout"
      title="Breadcrumb"
      description="Where the current page sits in the hierarchy. When the trail runs out of room, the middle folds into a menu, measured before paint so it never flickers, and it unfolds again as soon as there is space."
      source="theme/src/components/breadcrumb/breadcrumb.tsx"
    >
      <ShowcaseStage<BreadcrumbSceneData>
        label="Breadcrumb demo"
        story={() => import("../layout/ShowcaseStage.breadcrumb")}
        initial={{ depth: 3 }}
        minHeight="13rem"
      >
        {(scene, ctx) => <BreadcrumbScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Collapses to fit"
        description='Drag the slider: middle items fold into the “…” menu (arrow keys, typeahead and Escape work inside it) and come back as the row widens. The last item is the current page, with aria-current="page".'
        code={breadcrumbFitCode}
        stageClassName="items-stretch"
      >
        <BreadcrumbFitDemo />
      </Example>

      <Example
        title="Styles"
        description="A glass pill, slash and dot separators, a small size, and maxItems to always collapse long trails."
        code={breadcrumbStylesCode}
      >
        <div className="flex w-full min-w-0 flex-col items-start gap-5">
          <Breadcrumb variant="glass" items={short} renderLink={link} labels={{ nav: "Breadcrumb (glass)" }} />
          <Breadcrumb separator="slash" items={short} renderLink={link} labels={{ nav: "Breadcrumb (slash)" }} />
          <Breadcrumb separator="dot" size="sm" items={short} renderLink={link} labels={{ nav: "Breadcrumb (dot)" }} />
          <Breadcrumb maxItems={3} items={trail} renderLink={link} labels={{ nav: "Breadcrumb (collapsed)" }} />
        </div>
      </Example>

      <Example
        title="Router links and translations"
        description="renderLink renders every link through your router, including the links inside the collapse menu. Every string the component adds is a prop."
        code={breadcrumbRouterCode}
      >
        <Breadcrumb
          items={trail}
          maxItems={4}
          renderLink={link}
          labels={{ nav: "Fil d'Ariane", more: (n) => `Afficher ${n} pages masquées` }}
        />
      </Example>

      <PropsTable title="Breadcrumb" of={PROPS.Breadcrumb} />
      <PropsTable
        title="BreadcrumbItem"
        as="h3"
        rows={[
          ["label", "ReactNode", "", "Sets the text shown for the item."],
          ["href", "string", "", "Link target. Without one (and for the last item) it is plain text."],
          ["icon", "ReactNode", "", "Shows an icon before the label."],
          ["iconOnly", "boolean", "false", "Show only the icon; the label stays for screen readers."],
          ["textValue", "string", "", "Plain text for menu typeahead when the label is not a string."],
          ["render", "ReactElement", "", "Element for this one link (overrides renderLink)."],
          ["id", "string", "", "Stable key that identifies the item between renders."],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", 'Move through the links and the "…" button.'],
          ["Enter", "Follow a link, or open the collapsed-items menu."],
          ["Arrow keys, typeahead, Escape", "Work inside the menu as in any menu."],
        ]}
      />
      <A11yNotes
        items={[
          'A <nav aria-label="Breadcrumb"> with an ordered list; the last item has aria-current="page". Give a second breadcrumb on the page its own labels.nav.',
          "Separators are hidden from assistive tech. An icon-only item keeps its label for screen readers.",
          'The "…" menu lists the hidden pages as real links.',
        ]}
      />
    </Page>
  );
}
