/**
 * Fuzzy matching for the command palette (no dependencies).
 *
 * The query's letters must appear in order in the text, not necessarily together:
 * "nwtb" finds "New tab". Among all the ways the letters could line up, the best one wins
 * (dynamic programming, like fzf): runs of consecutive letters and letters at the start of
 * a word ("New Tab", "dark-mode", "camelCase") score high; gaps cost a little.
 *
 * Case, accents and spaces in the query are ignored ("cafe" finds "Café").
 * `indices` are UTF-16 offsets into the ORIGINAL text, ready for highlighting.
 *
 * Speed: each text is analysed once (`prepareText`) and reused for every keystroke. Pass a
 * prepared text when you keep many commands around; plain strings go through an LRU cache.
 */

export type FuzzyMatch = {
  /** Higher is better. Only meaningful for comparing matches of the same query. */
  score: number;
  /** Offsets (into the original text) of the characters that matched. */
  indices: number[];
};

const MATCH = 16;
const CONSECUTIVE = 8;
const GAP_START = 3;
const GAP_EXTEND = 1;
const BONUS_FIRST = 10;
const BONUS_WORD = 9;
const BONUS_CAMEL = 7;
const BONUS_DIGIT = 4;
const BONUS_PREFIX = 24;
const BONUS_SUBSTRING = 12;
const BONUS_EXACT = 60;

const SEPARATOR = /[\s\-_/\\.,:;|()[\]{}<>"'`·•&+@#]/;

/** A text analysed for matching: build it once with prepareText() and match it many times. */
export type PreparedText = {
  /** The original text. */
  readonly text: string;
  /** Normalised (lower-case, accent-free) characters. */
  readonly chars: readonly string[];
  /** The normalised characters joined, for exact / prefix / substring checks. */
  readonly flat: string;
  /** Offset in the original string of the character each normalised one came from. */
  readonly origin: Int32Array;
  /** Position bonus of each normalised character (word starts, camelCase...). */
  readonly bonus: Uint8Array;
};

function normalizeChar(ch: string) {
  return ch.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Lower-case, strip accents. Exported so custom filters can match the same way. */
export function normalizeText(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function analyse(text: string): PreparedText {
  const chars: string[] = [];
  const origin: number[] = [];
  const bonus: number[] = [];
  let offset = 0;
  let prev = "";
  for (const ch of text) {
    const norm = normalizeChar(ch);
    let b = 0;
    if (offset === 0) b = BONUS_FIRST;
    else if (SEPARATOR.test(prev)) b = BONUS_WORD;
    else if (/\p{Ll}/u.test(prev) && /\p{Lu}/u.test(ch)) b = BONUS_CAMEL;
    else if (/\p{L}/u.test(prev) !== /\p{L}/u.test(ch) && /\p{N}/u.test(prev + ch)) b = BONUS_DIGIT;
    let first = true;
    for (const n of norm) {
      chars.push(n);
      origin.push(offset);
      bonus.push(first ? b : 0);
      first = false;
    }
    prev = ch;
    offset += ch.length;
  }
  return { text, chars, flat: chars.join(""), origin: Int32Array.from(origin), bonus: Uint8Array.from(bonus) };
}

/*
 * Plain strings: a least-recently-used cache, so labels aren't re-analysed on every keystroke.
 * A hit moves the entry to the back; past the limit the oldest quarter goes.
 */
const CACHE_LIMIT = 8000;
const cache = new Map<string, PreparedText>();

/**
 * Analyse a text once so it can be matched against many queries cheaply. Keep the result
 * next to your data (e.g. per command) and pass it to fuzzyMatch / matchCommand.
 */
export function prepareText(text: string): PreparedText {
  const hit = cache.get(text);
  if (hit) {
    cache.delete(text);
    cache.set(text, hit);
    return hit;
  }
  const next = analyse(text);
  cache.set(text, next);
  if (cache.size > CACHE_LIMIT) {
    let drop = CACHE_LIMIT / 4;
    for (const key of cache.keys()) {
      cache.delete(key);
      if (--drop <= 0) break;
    }
  }
  return next;
}

function prepared(text: string | PreparedText): PreparedText {
  return typeof text === "string" ? prepareText(text) : text;
}

/* The same query is matched against every command: normalise it once. */
let lastQuery: { raw: string; flat: string; chars: string[] } = { raw: "", flat: "", chars: [] };

function preparedQuery(query: string) {
  if (query !== lastQuery.raw) {
    const flat = normalizeText(query).trim();
    lastQuery = { raw: query, flat, chars: Array.from(flat.replace(/\s+/g, "")) };
  }
  return lastQuery;
}

/** Fuzzy-match `query` against `text`. Returns null when the letters don't all appear in order. */
export function fuzzyMatch(text: string | PreparedText, query: string): FuzzyMatch | null {
  const { flat: rawQuery, chars: q } = preparedQuery(query);
  if (q.length === 0) return { score: 0, indices: [] };

  const { chars, origin, bonus, flat } = prepared(text);
  const n = chars.length;
  const m = q.length;
  if (m > n) return null;

  // Cheap rejection: is the query a subsequence at all?
  for (let i = 0, j = 0; i < m; j++) {
    if (j >= n) return null;
    if (chars[j] === q[i]) i++;
  }

  // best[i*n + j]: best score with q[i] matched at text[j].
  // carry[i*n + j]: best score with q[0..i] matched at or before j, gap costs paid up to j.
  const NEG = -Infinity;
  const best = new Float64Array(m * n).fill(NEG);
  const carry = new Float64Array(m * n).fill(NEG);
  const fromRun = new Uint8Array(m * n); // best came from the previous letter right before it
  const carryFromBest = new Uint8Array(m * n); // carry came from best at the same cell

  for (let i = 0; i < m; i++) {
    const qc = q[i];
    for (let j = 0; j < n; j++) {
      const cell = i * n + j;
      if (chars[j] === qc) {
        const base = MATCH + (bonus[j] ?? 0);
        if (i === 0) {
          // A small nudge towards matches that start early in the text.
          best[cell] = base - Math.min(j, 12) * 0.25;
        } else if (j > 0) {
          const prev = (i - 1) * n + j - 1;
          const run = (best[prev] ?? NEG) + CONSECUTIVE;
          const jump = carry[prev] ?? NEG;
          if (run >= jump && run > NEG) {
            best[cell] = run + base;
            fromRun[cell] = 1;
          } else if (jump > NEG) {
            best[cell] = jump + base;
          }
        }
      }
      const stay = (best[cell] ?? NEG) - GAP_START;
      const extend = j > 0 ? (carry[cell - 1] ?? NEG) - GAP_EXTEND : NEG;
      if (stay >= extend) {
        carry[cell] = stay;
        carryFromBest[cell] = 1;
      } else {
        carry[cell] = extend;
      }
    }
  }

  let end = -1;
  let score = NEG;
  const last = (m - 1) * n;
  for (let j = 0; j < n; j++) {
    const value = best[last + j] ?? NEG;
    if (value > score) {
      score = value;
      end = j;
    }
  }
  if (end < 0 || score === NEG) return null;

  // Walk back through the choices to find which characters matched.
  const matched: number[] = [];
  let i = m - 1;
  let j = end;
  while (i >= 0 && j >= 0) {
    matched.push(j);
    if (i === 0) break;
    const cell = i * n + j;
    i -= 1;
    j -= 1;
    if (fromRun[cell]) continue;
    // Follow the carried gap back to where letter i was actually matched.
    while (j > 0 && !carryFromBest[i * n + j]) j -= 1;
  }
  matched.reverse();

  if (flat === rawQuery) score += BONUS_EXACT;
  else if (flat.startsWith(rawQuery)) score += BONUS_PREFIX;
  else if (flat.includes(rawQuery)) score += BONUS_SUBSTRING;

  // Several normalised characters can come from one original (rare): report each once.
  const indices = [...new Set(matched.flatMap((k) => origin[k] ?? []))];
  return { score, indices };
}

/** Best match of a query against a label and its extra search words. Keyword hits don't highlight. */
export function matchCommand(
  query: string,
  label: string | PreparedText,
  extra: readonly (string | PreparedText | undefined)[] = [],
): FuzzyMatch | null {
  const direct = fuzzyMatch(label, query);
  let bestExtra: FuzzyMatch | null = null;
  for (const text of extra) {
    if (!text) continue;
    const hit = fuzzyMatch(text, query);
    if (hit && (!bestExtra || hit.score > bestExtra.score)) bestExtra = hit;
  }
  if (bestExtra) {
    const weighted = { score: bestExtra.score * 0.75, indices: [] };
    if (!direct || weighted.score > direct.score) return weighted;
  }
  return direct;
}
