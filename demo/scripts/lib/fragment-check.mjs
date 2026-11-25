// Fragment descriptions: a props description must be a real sentence (at least 3 words; up to 7 words it also needs a finite verb from a closed list), in both sources the site
// renders: the generated rows (src/generated/props/*.ts) and the hand-written `rows={[...]}` of PropsTable in src/pages/**.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// The repo root has the JS compiler API (the demo/theme ones are the native TypeScript 7).
const DEMO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const ts = createRequire(join(DEMO_ROOT, "../package.json"))("typescript");

export const MIN_WORDS = 3;
/** Descriptions up to this many words must contain a finite verb; longer ones are assumed to carry one. */
export const VERBLESS_MAX_WORDS = 7;

// A closed list of finite verbs and auxiliaries. Noun/verb homographs (size, label, set, state, value, change, list, order, display,
// control, focus, color ...) only count in their 3rd-person -s form ("Sets the size." passes, "Row size." fails), so base forms
// below are limited to verbs that are not also common nouns. Participles count only at the start or after an auxiliary ("Shown when open.", "Is called twice.").
const VERBS = new Set(
  `is are was were be been being has have had do does did can could may might must should shall will would cannot
  sets shows hides uses passes gives takes makes gets puts keeps lets runs calls fires opens closes fills holds applies renders
  draws matches reads writes enables disables toggles skips accepts allows prevents replaces adds removes changes updates resets
  sends selects focuses moves scrolls stops starts begins ends waits returns reaches includes lists names labels sorts groups
  stacks splits joins wraps clamps reserves announces picks chooses attaches marks tells needs wants looks works fits follows
  leaves stays turns resolves exposes receives provides contains carries triggers covers sits links points defaults says speaks
  counts feeds mounts loads lifts owns controls binds forwards emits switches inherits overrides extends positions places lays
  anchors aligns offsets sizes scales fades animates pauses plays loops flips spins tilts snaps drags drops hovers presses clicks
  taps types enters submits cancels confirms dismisses appears becomes remains exists differs depends determines sees gets
  displays orders colors states values rounds blocks tracks fixes caps limits fires ties keeps hands wires mirrors flows
  see hide use pass give take make get put keep let run call fire open close fill hold apply render draw match read write enable
  disable skip accept allow prevent replace add remove update reset send select move scroll stop start begin wait return reach
  include join wrap clamp reserve announce pick choose attach tell need want follow leave stay turn resolve expose receive
  provide contain carry trigger cover link point say speak mount load lift own bind forward emit inherit override extend place
  align animate pause play loop flip spin tilt snap drag hover press click tap enter submit cancel confirm dismiss appear become
  remain exist differ depend determine fit sit feed stack split group sort mark wrap fade scale offset anchor lay
  show format formats print prints shorten shortens trim trims tint tints blur blurs highlight highlights reveal reveals
  render format wrap announce clear clears dim dims truncate truncates reorder reorders hold insert inserts cycle cycles
  run read set put let`.split(/\s+/),
);
// Participles ("shown", "hidden", "called", "selected") are verbs only as the sentence's first word ("Called when ...") or after an
// auxiliary or a plain adverb ("is shown", "only called"). Elsewhere they are adjectives: "Initial position when uncontrolled."
const IRREGULAR_PARTICIPLES = new Set("shown hidden given taken made done kept drawn written".split(" "));
const PARTICIPLE_LEADERS = new Set(
  "is are was were be been being gets get got only also not never always just then then".split(" "),
);
const NOT_PARTICIPLES = new Set([
  "need",
  "speed",
  "feed",
  "seed",
  "bed",
  "red",
  "embed",
  "shed",
  "weed",
  "hundred",
  "sacred",
]);

/** Strips Markdown and code spans so only the prose is judged. */
function words(text) {
  return text
    .replace(/`[^`]*`/g, " code ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_]/g, "")
    .split(/[^A-Za-z']+/)
    .filter(Boolean);
}

/** The reason a description is a fragment, or "" when it is a sentence. */
export function fragmentReason(description) {
  const text = description.trim();
  const w = words(text);
  if (w.length < MIN_WORDS) return `under ${MIN_WORDS} words`;
  // A doubled word: the same bare word twice in a row with only a space between ("a a", "to to"), code spans excluded.
  const tokens = text.replace(/`[^`]*`/g, " \u0000 ").split(/\s+/);
  const twice = tokens.findIndex(
    (x, i) => i > 0 && /^[A-Za-z]+$/.test(x) && x.toLowerCase() === tokens[i - 1].toLowerCase(),
  );
  if (twice > 0) return `doubled word "${tokens[twice]}"`;
  if (w.length > VERBLESS_MAX_WORDS) return "";
  const hasVerb = w.some((x, i) => {
    const l = x.toLowerCase();
    if (VERBS.has(l) || /n't$/.test(l)) return true;
    const participle = IRREGULAR_PARTICIPLES.has(l) || (/ed$/.test(l) && l.length > 4 && !NOT_PARTICIPLES.has(l));
    return participle && (i === 0 || PARTICIPLE_LEADERS.has(w[i - 1].toLowerCase()));
  });
  return hasVerb ? "" : "no verb";
}

/** [{ source, name, description }] of every generated row. */
export function generatedRows(demoDir) {
  const dir = join(demoDir, "src/generated/props");
  const out = [];
  for (const f of readdirSync(dir).filter((n) => !n.startsWith("._"))) {
    // macOS AppleDouble metadata, not source
    const src = readFileSync(join(dir, f), "utf8");
    const start = src.indexOf("= [[");
    if (start < 0) continue;
    const json = src.slice(start + 2, src.lastIndexOf("];") + 1);
    for (const row of JSON.parse(json)) out.push({ source: `props/${f}`, name: row[0], description: row[3] });
  }
  return out;
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir).filter((n) => !n.startsWith("._"))) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.tsx$/.test(e)) acc.push(p);
  }
  return acc;
}

function literalText(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const a = literalText(node.left);
    const b = literalText(node.right);
    return a === null || b === null ? null : a + b;
  }
  if (ts.isParenthesizedExpression(node)) return literalText(node.expression);
  if (ts.isTemplateExpression(node))
    return node.head.text + node.templateSpans.map((s) => " x " + s.literal.text).join("");
  return null;
}

/** [{ source, name, description }] of every `<PropsTable rows={[[name, type, default, description], ...]}>` literal row in src/pages. */
export function handWrittenRows(demoDir) {
  const out = [];
  for (const file of walk(join(demoDir, "src/pages"))) {
    const text = readFileSync(file, "utf8");
    if (!text.includes("rows=")) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    // `const kitRows = [[...]]` declared in the same file, so `rows={kitRows}` is checked too.
    const consts = new Map();
    const collect = (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        let init = node.initializer;
        while (ts.isAsExpression(init) || ts.isSatisfiesExpression(init)) init = init.expression;
        if (ts.isArrayLiteralExpression(init)) consts.set(node.name.text, init);
      }
      ts.forEachChild(node, collect);
    };
    collect(sf);
    const addRows = (array) => {
      for (const row of array.elements) {
        if (!ts.isArrayLiteralExpression(row) || row.elements.length < 4) continue;
        const name = literalText(row.elements[0]);
        const description = literalText(row.elements[3]);
        if (name === null || description === null) continue;
        const line = sf.getLineAndCharacterOfPosition(row.getStart()).line + 1;
        out.push({ source: `${file.slice(demoDir.length + 1)}:${line}`, name, description });
      }
    };
    const visit = (node) => {
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText() === "rows" &&
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression
      ) {
        let expr = node.initializer.expression;
        if (ts.isIdentifier(expr)) expr = consts.get(expr.text) ?? expr;
        if (ts.isArrayLiteralExpression(expr)) addRows(expr);
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return out;
}

/** Every fragment description in both sources: [{ source, name, description, reason }]. */
export function findFragments(demoDir) {
  return [...generatedRows(demoDir), ...handWrittenRows(demoDir)].flatMap((r) => {
    const reason = fragmentReason(r.description);
    return reason ? [{ ...r, reason }] : [];
  });
}
