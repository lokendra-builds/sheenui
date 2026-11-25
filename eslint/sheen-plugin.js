// SheenUI's own lint rules.
//
//   sheen/require-export-jsdoc   every exported component / hook carries a JSDoc block, with the
//                                tags the docs gate asks for (@example, @see), so AI coding tools
//                                understand the component from the source alone. With
//                                `coverAllExports: true` every other exported symbol (helper
//                                function, class, constant, type alias, interface, enum) needs a
//                                doc comment too; a one-sentence description is enough there.
//   sheen/no-hardcoded-colors    no oklch() / hex / rgb() / hsl() literals in component code:
//                                colours come from the tokens, so the style presets and dark mode
//                                recolour everything. Mask gradients are allowed (they are shapes,
//                                not colours); brand assets are allow-listed in eslint.config.js.
//   sheen/require-disable-reason every eslint-disable comment says why, after ` -- `, so a
//                                suppression documents the deliberate exception it covers.
//   sheen/no-direction-detection no hand-rolled text-direction reads (`getComputedStyle(x).direction`,
//                                `dir` attributes, `document.dir`): components read it through
//                                hooks/use-direction.ts (useResolvedDirection, isRtlAt), one observer
//                                for the whole page.

/** A component name: PascalCase with at least one lowercase letter (so MAX_SURFACES is not one). */
const COMPONENT = /^[A-Z][A-Za-z0-9]*$/;
const HOOK = /^use[A-Z][A-Za-z0-9]*$/;

function isLowerCamelConstant(name) {
  return !/[a-z]/.test(name);
}

/** Components and hooks are recognised by name; everything else is a "helper" kind (function, class, constant, type). */
function kindOf(name) {
  if (HOOK.test(name)) return "hook";
  if (COMPONENT.test(name) && !isLowerCamelConstant(name)) return "component";
  return null;
}

/** The shortest description a helper / type / constant doc comment may have (`coverAllExports`). */
const MIN_HELPER_DESCRIPTION = 10;

/** The kind label for a non-component/hook symbol, from its declaration. */
function helperKind(declKind) {
  return declKind ?? "symbol";
}

/** The words of a doc block without the tag names (`@deprecated Use X` counts as "Use X"). */
function descriptionOf(text) {
  return text.replace(/(^|\s)@[a-zA-Z]+/g, " ").trim();
}

/** The JSDoc block (`/** … *\/`) directly above `node`, or null. */
function jsdocBefore(sourceCode, node) {
  const comments = sourceCode.getCommentsBefore(node);
  const last = comments[comments.length - 1];
  if (!last || last.type !== "Block" || !last.value.startsWith("*")) return null;
  return last;
}

/** @type {import("eslint").Rule.RuleModule} */
const requireExportJsdoc = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require a JSDoc block (with the given tags) on every exported component and hook; with coverAllExports, a description on every other exported symbol too.",
    },
    schema: [
      {
        type: "object",
        properties: {
          requireTags: { type: "array", items: { type: "string" } },
          minLength: { type: "integer", minimum: 0 },
          coverAllExports: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingHelper:
        "Exported {{kind}} `{{name}}` has no doc comment. Add a one-sentence description (for helpers: say if it is safe to call on the server).",
      emptyHelper:
        "Doc comment on exported {{kind}} `{{name}}` has no description (at least {{min}} characters of text).",
      missing:
        "Exported {{kind}} `{{name}}` has no JSDoc block. Document what it is, every prop (type, default), an @example, keyboard/a11y notes and an @see docs link.",
      missingTag: "JSDoc on exported {{kind}} `{{name}}` is missing @{{tag}}.",
      tooShort:
        "JSDoc on exported {{kind}} `{{name}}` is only {{length}} characters; describe it properly (purpose, props, keyboard and a11y behaviour).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] ?? {};
    const requireTags = options.requireTags ?? ["example", "see"];
    const minLength = options.minLength ?? 40;
    const coverAllExports = options.coverAllExports === true;
    /** Declarations already reported, so `export { X }` after `const X` is reported once. */
    const seen = new Set();
    /** Names of overloaded functions already checked (the doc block sits above the first signature). */
    const seenNames = new Set();

    /** `declKind` labels helpers: "function" | "class" | "constant" | "type" | "interface" | "enum". */
    function check(name, declNode, reportNode, declKind) {
      const kind =
        declKind === "type" || declKind === "interface" || declKind === "enum" || declKind === "class"
          ? null
          : kindOf(name);
      if (!kind && !coverAllExports) return;
      if (seen.has(declNode)) return;
      seen.add(declNode);
      const doc = jsdocBefore(sourceCode, declNode);
      const text = doc ? doc.value.replace(/^\s*\*\s?/gm, "").trim() : "";
      if (!kind) {
        // Helper / type / constant: a one-sentence description is enough.
        const data = { kind: helperKind(declKind), name, min: String(MIN_HELPER_DESCRIPTION) };
        if (!doc) context.report({ node: reportNode, messageId: "missingHelper", data });
        else if (descriptionOf(text).length < MIN_HELPER_DESCRIPTION)
          context.report({ node: reportNode, messageId: "emptyHelper", data });
        return;
      }
      if (!doc) {
        context.report({ node: reportNode, messageId: "missing", data: { kind, name } });
        return;
      }
      if (text.length < minLength) {
        context.report({ node: reportNode, messageId: "tooShort", data: { kind, name, length: String(text.length) } });
      }
      for (const tag of requireTags) {
        if (!new RegExp(`(^|\\s)@${tag}\\b`).test(text)) {
          context.report({ node: reportNode, messageId: "missingTag", data: { kind, name, tag } });
        }
      }
    }

    /** `export function X` / `export const X = …` / `export type X = …`: the doc block sits above the export. */
    function checkDeclaration(exportNode) {
      const decl = exportNode.declaration;
      if (!decl) return;
      if ((decl.type === "FunctionDeclaration" || decl.type === "TSDeclareFunction") && decl.id) {
        if (seenNames.has(decl.id.name)) return;
        seenNames.add(decl.id.name);
        check(decl.id.name, exportNode, decl.id, "function");
      }
      if (decl.type === "VariableDeclaration") {
        for (const d of decl.declarations) {
          if (d.id.type !== "Identifier") continue;
          const fn = d.init?.type === "ArrowFunctionExpression" || d.init?.type === "FunctionExpression";
          check(d.id.name, exportNode, d.id, fn ? "function" : "constant");
        }
      }
      if (coverAllExports && decl.id) {
        if (decl.type === "ClassDeclaration") check(decl.id.name, exportNode, decl.id, "class");
        if (decl.type === "TSTypeAliasDeclaration") check(decl.id.name, exportNode, decl.id, "type");
        if (decl.type === "TSInterfaceDeclaration") check(decl.id.name, exportNode, decl.id, "interface");
        if (decl.type === "TSEnumDeclaration") check(decl.id.name, exportNode, decl.id, "enum");
      }
    }

    /** `export { X, Y }` of locals declared earlier in the file. */
    function checkSpecifiers(exportNode) {
      if (exportNode.source || !exportNode.specifiers.length) return;
      const scope = sourceCode.getScope(exportNode);
      for (const spec of exportNode.specifiers) {
        const isType = spec.exportKind === "type" || exportNode.exportKind === "type";
        if (isType && !coverAllExports) continue;
        if (spec.local.type !== "Identifier") continue;
        const variable = scope.set.get(spec.local.name) ?? scope.upper?.set.get(spec.local.name);
        const def = variable?.defs[0];
        if (!def) continue;
        let declNode = def.node;
        if (def.type === "Variable") declNode = def.node.parent;
        if (!declNode || declNode.type === "ImportSpecifier" || def.type === "ImportBinding") continue;
        let declKind = "constant";
        if (declNode.type === "FunctionDeclaration" || declNode.type === "TSDeclareFunction") declKind = "function";
        else if (declNode.type === "ClassDeclaration") declKind = "class";
        else if (declNode.type === "TSTypeAliasDeclaration") declKind = "type";
        else if (declNode.type === "TSInterfaceDeclaration") declKind = "interface";
        else if (declNode.type === "TSEnumDeclaration") declKind = "enum";
        else if (def.type === "Variable") {
          const init = def.node.init;
          if (init?.type === "ArrowFunctionExpression" || init?.type === "FunctionExpression") declKind = "function";
        }
        check(spec.exported.name ?? spec.local.name, declNode, spec, declKind);
      }
    }

    return {
      ExportNamedDeclaration(node) {
        checkDeclaration(node);
        checkSpecifiers(node);
      },
    };
  },
};

// Tailwind palette utilities that bypass the tokens: `text-white`, `bg-black/40`, `fill-white`, `via-white/35`, `bg-red-500`.
const PALETTE =
  /(?<![\w-])(?:[a-z-]+:)*(?:text|bg|fill|stroke|from|via|to|border|outline|ring|decoration|divide|caret|accent|shadow)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/\d+)?(?![\w-])/g;

// oklch()/oklab(), rgb()/hsl(), and hex colours that stand on their own (not `url(#id)`, not `#root`).
const COLOR_FN = /\b(?:oklch|oklab|lch|lab|rgba?|hsla?|hwb|color)\(/g;
const HEX = /(^|[\s:,("'`[_])(#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4}))(?![0-9a-z-])/gi;

/** @type {import("eslint").Rule.RuleModule} */
const noHardcodedColors = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow hard-coded colour literals (oklch, hex, rgb, hsl) in component code; use SheenUI tokens.",
    },
    schema: [
      {
        type: "object",
        properties: {
          /** Substrings that mark a literal as a shape, not a colour (mask gradients by default). */
          allowContaining: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      color:
        "Hard-coded colour `{{value}}`: use a token (var(--sheen-*), bg-sheen-*, text-sheen-*) so the style presets, dark mode and High Contrast recolour it.",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const allowContaining = options.allowContaining ?? [
      "mask-image",
      "mask:",
      "mask]",
      "-webkit-mask",
      "mask-composite",
    ];

    function scan(node, text) {
      if (typeof text !== "string" || text.length < 4) return;
      if (allowContaining.some((s) => text.includes(s))) return;
      const found = new Set();
      for (const m of text.matchAll(COLOR_FN)) found.add(m[0].slice(0, -1) + "()");
      for (const m of text.matchAll(HEX)) found.add(m[2]);
      for (const m of text.matchAll(PALETTE)) found.add(m[0].replace(/^(?:[a-z-]+:)+/, ""));
      for (const value of found) context.report({ node, messageId: "color", data: { value } });
    }

    return {
      Literal(node) {
        scan(node, node.value);
      },
      TemplateElement(node) {
        scan(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

/** Every `eslint-disable` comment must say why: `// eslint-disable-next-line rule -- the reason`. */
const requireDisableReason = {
  meta: {
    type: "suggestion",
    docs: { description: "Require a description after `--` on every eslint-disable directive." },
    schema: [],
    messages: { reason: "Say why this rule is disabled: `eslint-disable... rule -- the reason`." },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = /^\s*eslint-disable(?:-next-line|-line)?\b([\s\S]*)$/.exec(comment.value);
          if (!match) continue;
          const reason = /\s--\s+(\S[\s\S]*)$/.exec(match[1]);
          if (!reason) context.report({ loc: comment.loc, messageId: "reason" });
        }
      },
    };
  },
};

/**
 * One way to learn the text direction: `useResolvedDirection` (render) or `isRtlAt` (key handlers), both in
 * hooks/use-direction.ts. Forbids reading it any other way: `getComputedStyle(...).direction`, `.closest("[dir]")`
 * and `document.dir` / `document.documentElement.dir`.
 */
const noDirectionDetection = {
  meta: {
    type: "problem",
    docs: { description: "Detect text direction only through hooks/use-direction.ts." },
    schema: [],
    messages: {
      direction:
        "Do not detect the text direction by hand: use `useResolvedDirection` (render) or `isRtlAt(element)` (event handlers) from hooks/use-direction.",
    },
  },
  create(context) {
    const isCall = (node, name) =>
      node?.type === "CallExpression" &&
      ((node.callee.type === "Identifier" && node.callee.name === name) ||
        (node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === name));
    const isDocumentish = (node) =>
      (node?.type === "Identifier" && node.name === "document") ||
      (node?.type === "MemberExpression" &&
        node.property.type === "Identifier" &&
        node.property.name === "documentElement");
    return {
      MemberExpression(node) {
        if (node.computed || node.property.type !== "Identifier") return;
        if (node.property.name === "direction" && isCall(node.object, "getComputedStyle"))
          context.report({ node, messageId: "direction" });
        if (node.property.name === "dir" && isDocumentish(node.object))
          context.report({ node, messageId: "direction" });
      },
      CallExpression(node) {
        if (!isCall(node, "closest")) return;
        const arg = node.arguments[0];
        if (arg?.type === "Literal" && typeof arg.value === "string" && /\[dir[\]=~|^$*]/.test(arg.value))
          context.report({ node, messageId: "direction" });
      },
    };
  },
};

const plugin = {
  meta: { name: "eslint-plugin-sheen", version: "1.0.0" },
  rules: {
    "require-export-jsdoc": requireExportJsdoc,
    "no-hardcoded-colors": noHardcodedColors,
    "require-disable-reason": requireDisableReason,
    "no-direction-detection": noDirectionDetection,
  },
};

export default plugin;
