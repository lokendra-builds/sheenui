import { useCallback, useMemo, useState } from "react";
import { CommandPalette, defaultCommandPaletteLabels, type CommandFilter, type CommandItem } from "@sheenui/theme";

import { routes } from "../routes";
import { navigate } from "../router";
import { allExportsFor, exportsFor } from "./route-exports";
import { MAX_SEARCH_RESULTS, createRanker, type SearchFields } from "./search-rank";
import { SEARCH_SYNONYMS } from "./search-synonyms";

const LABELS = {
  ...defaultCommandPaletteLabels,
  title: "Search the docs",
  inputLabel: "Search pages or components",
};

const LONG_PLACEHOLDER = "Page or component name, e.g. SegmentedControl";
/** A phone-width field shows the short hint: the long one is cut mid-word at 320 to 414 px. */
const SHORT_PLACEHOLDER = "Search the docs";

/** Every docs page as a command: found by its sidebar title, its group, its URL words or any component and hook it documents. */
export default function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // The palette is a lazy, client-only chunk (never prerendered), so reading the viewport here can't mismatch hydration.
  const [placeholder] = useState(() =>
    window.matchMedia("(max-width: 30rem)").matches ? SHORT_PLACEHOLDER : LONG_PLACEHOLDER,
  );
  const labels = useMemo(() => ({ ...LABELS, placeholder }), [placeholder]);
  const { items, fields } = useMemo(() => {
    const fields = new Map<string, SearchFields>();
    const items = routes
      .filter((route) => !route.hidden && route.path !== "/")
      .map<CommandItem>((route) => {
        const names = exportsFor(route.path);
        fields.set(route.path, {
          title: route.title,
          aliases: SEARCH_SYNONYMS[route.path]?.aliases,
          // The components and hooks the page documents (main one first) count as keywords; the rest of the exports as body.
          keywords: [...(SEARCH_SYNONYMS[route.path]?.keywords ?? []), ...names],
          body: [
            ...allExportsFor(route.path),
            ...route.path
              .split("/")
              .filter(Boolean)
              .flatMap((part) => part.split("-")),
          ],
        });
        return {
          id: route.path,
          label: route.title,
          group: route.group,
          hint: names[0] ? <code className="font-sheen-mono text-xs">{names[0]}</code> : undefined,
          onSelect: () => navigate(route.path),
        };
      });
    return { items, fields };
  }, []);
  // Title first (exact, prefix, word), then aliases, keywords and the body; a broad word lists the best few, not the site.
  const ranker = useMemo(() => createRanker(fields), [fields]);
  const filter = useCallback<CommandFilter>((item, query) => ranker(item.id, query), [ranker]);
  return (
    <CommandPalette
      items={items}
      open={open}
      onOpenChange={onOpenChange}
      shortcut={false}
      maxRecent={0}
      labels={labels}
      filter={filter}
      maxResults={MAX_SEARCH_RESULTS}
    />
  );
}
