/** What the docs search knows about one page. */
export type SearchFields = {
  /** The page's sidebar title. */
  title: string;
  /** Other names for the page (what people call it): ranked just under a title match. */
  aliases?: readonly string[];
  /** Words the page is about: ranked under aliases. */
  keywords?: readonly string[];
  /** The exports and URL words of the page: the "body", ranked last. */
  body?: readonly string[];
};

/** A match: higher `score` ranks first, `indices` are the title letters to highlight. */
export type SearchMatch = { score: number; indices: number[] };

/** The tiers, so a title always outranks an alias, an alias a keyword, a keyword the body. */
const TITLE = { exact: 1000, prefix: 900, word: 800, substring: 600 } as const;
const ALIAS = { exact: 500, prefix: 500, word: 500, substring: 450 } as const;
const KEYWORD = { exact: 400, prefix: 400, word: 400, substring: 350 } as const;
const BODY = { exact: 300, prefix: 300, word: 250, substring: 200 } as const;
const FUZZY = 100;
/** Most results the docs palette lists: a broad word ("sheet") ranks and stops instead of listing the site. */
export const MAX_SEARCH_RESULTS = 12;

type Kind = "exact" | "prefix" | "word" | "substring";

/** How `query` sits in `text` (both lower case): the whole text, its start, the start of a word, or anywhere. */
function kindOf(text: string, query: string): Kind | null {
  if (text === query) return "exact";
  if (text.startsWith(query)) return "prefix";
  if (` ${text.replace(/[-/_]/g, " ")}`.includes(` ${query}`)) return "word";
  if (query.length >= 3 && text.includes(query)) return "substring";
  return null;
}

/** The best tier of a group of texts for one string (a phrase or a single word), 0 for none. */
function best(texts: readonly string[] | undefined, query: string, tiers: Record<Kind, number>) {
  let top = 0;
  for (const text of texts ?? []) {
    const kind = kindOf(text.toLowerCase(), query);
    if (kind && tiers[kind] > top) top = tiers[kind];
  }
  return top;
}

/** The letters of `query` found in order in `text`, or null. Only the title is matched this way (a typo-tolerant last resort, from 5 letters: shorter queries match too much). */
function subsequence(text: string, query: string): number[] | null {
  const lower = text.toLowerCase();
  const indices: number[] = [];
  let from = 0;
  for (const char of query) {
    const at = lower.indexOf(char, from);
    if (at === -1) return null;
    indices.push(at);
    from = at + 1;
  }
  return indices;
}

/** Where the title tier of `query` sits, as highlighted letters. */
function titleIndices(title: string, query: string) {
  const at = title.toLowerCase().indexOf(query);
  return at === -1 ? [] : Array.from({ length: query.length }, (_, i) => at + i);
}

function tierOf(fields: SearchFields, query: string, withBody = true): number {
  const title = best([fields.title], query, TITLE);
  return Math.max(
    title,
    best(fields.aliases, query, ALIAS),
    best(fields.keywords, query, KEYWORD),
    withBody ? best(fields.body, query, BODY) : 0,
  );
}

/**
 * Ranks one page for a query: an exact title first, then a title that starts with it, then a title word, then a title
 * that contains it, then aliases, then keywords, then the body (export and URL words). A phrase ("bottom sheet") is
 * tried whole first; if it is not found whole, every word of it must match somewhere. Letters out of order in the title
 * ("segcon") still match, last. Returns null when the page does not match.
 */
export function rankSearch(fields: SearchFields, rawQuery: string): SearchMatch | null {
  const query = rawQuery.trim().toLowerCase().replace(/\s+/g, " ");
  if (!query) return { score: 0, indices: [] };
  const whole = tierOf(fields, query);
  if (whole > 0) {
    // Shorter titles first among equals (a closer name), by a fraction that never crosses a tier.
    const score = whole + 1 - Math.min(fields.title.length, 80) / 100;
    return { score, indices: whole >= TITLE.substring ? titleIndices(fields.title, query) : [] };
  }
  const words = query.split(" ");
  if (words.length > 1) {
    const tiers = words.map((word) => tierOf(fields, word, false));
    if (tiers.every((tier) => tier > 0)) {
      return { score: Math.min(...tiers) - 60 - fields.title.length / 100, indices: [] };
    }
  }
  if (query.length >= 5 && !query.includes(" ")) {
    const indices = subsequence(fields.title, query);
    if (indices) return { score: FUZZY - fields.title.length / 100, indices };
  }
  return null;
}

/**
 * A ranker over a set of pages that also cuts the tail: once any page matches by title, alias or a whole keyword, pages that only
 * match by body words, a keyword fragment or letters out of order are left out, so a weak hit never pads or outranks real ones. The best score
 * of a query is computed once and reused for every page of that query.
 */
export function createRanker(fields: ReadonlyMap<string, SearchFields>) {
  let lastQuery: string | null = null;
  let floor = 0;
  return (id: string, query: string): SearchMatch | null => {
    const entry = fields.get(id);
    if (!entry) return null;
    if (query !== lastQuery) {
      let top = 0;
      for (const other of fields.values()) top = Math.max(top, rankSearch(other, query)?.score ?? 0);
      floor = top >= KEYWORD.word ? KEYWORD.word : 0;
      lastQuery = query;
    }
    const match = rankSearch(entry, query);
    return match && match.score >= floor ? match : null;
  };
}
