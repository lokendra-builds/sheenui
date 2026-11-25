// ESLint flat config for the whole workspace:
// typescript-eslint strict + stylistic (type-checked), react-hooks, jsx-a11y strict, jsdoc, and
// SheenUI's own rules (eslint/sheen-plugin.js): the doc-comment gate on every exported component
// and hook, and no hard-coded colours in component code.
//
// Type information: TypeScript 7 (the native compiler) ships no JavaScript API, which
// typescript-eslint needs, so the root installs TypeScript 6 for linting only. `tsc` in each
// package is still TypeScript 7.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import { readFileSync } from "node:fs";

import sheen from "./eslint/sheen-plugin.js";

// max-lines limit and allow-list (see the block at the end of this config).
function maxLinesBlocks() {
  const allow = JSON.parse(readFileSync(new URL("./eslint.max-lines-allow.json", import.meta.url), "utf8"));
  const opts = (max) => ["error", { max, skipBlankLines: true, skipComments: true }];
  return [
    { files: ["theme/src/**/*.{ts,tsx}", "demo/src/**/*.{ts,tsx}"], rules: { "max-lines": opts(allow.limit) } },
    ...allow.files.map(({ path, lines }) => ({ files: [path], rules: { "max-lines": opts(lines) } })),
  ];
}

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      // Standalone starter apps with their own toolchain (copied SheenUI source, their own tsconfig); not part of the workspace.
      "templates/**",
      // Local hand-off folder (git-ignored): never linted.
      ".handoff/**",
      // macOS AppleDouble metadata (`._name`), left by copying the tree from a Mac: binary, not source.
      "**/._*",
      // Scratch scripts left by tooling runs (`name.tmp.mjs`): kept on disk, not source.
      "**/*.tmp.mjs",
      "**/.w9*-verify.mjs",
      "**/.scan-tmp.mjs",
      "**/dist/**",
      "**/dist-*/**",
      "**/coverage/**",
      "**/test-results/**",
      "**/playwright-report/**",
      "**/blob-report/**",
      "**/.vite/**",
      "**/.lighthouseci/**",
      // Hand-written declarations for plain-JS Vite plugins (type-checked by tsc, nothing to lint).
      "**/*.d.mts",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.strict,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["theme/tsconfig.json", "theme/tsconfig.test.json", "demo/tsconfig.json", "demo/tsconfig.e2e.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser },
    },
    plugins: { jsdoc },
    rules: {
      // "no `any`" is a hard gate.
      "@typescript-eslint/no-explicit-any": "error",
      // The codebase declares object shapes with `type` (619 of them, 0 `interface`), so the
      // stylistic default ("interface") would flag all of it for no gain.
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // Components use `function X()` declarations and arrow callbacks freely.
      "@typescript-eslint/no-unnecessary-condition": ["error", { allowConstantLoopConditions: true }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowBoolean: true }],
      // An underscore prefix marks a deliberately unused name (a typed-but-ignored callback argument,
      // a caught error, an array slot), and `({ omit: _, ...rest })` is how a key is left out of a copy.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
      // React 19 ref-as-prop / render-prop composition: a lone `{}` type is legitimate in generics.
      "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
      // JSDoc hygiene (the presence gate is sheen/require-export-jsdoc). Keyboard, accessibility, glass and motion
      // notes are prose paragraphs ("Keyboard:", "Accessibility:", "Glass:", "Motion:"), not custom tags, so only
      // standard tags are allowed (see the doc-comment rule in eslint/sheen-plugin.js).
      "jsdoc/check-tag-names": ["error", { definedTags: ["defaultLabels"] }],
      "jsdoc/check-alignment": "error",
      "jsdoc/no-multi-asterisks": "error",
      "jsdoc/check-param-names": ["error", { checkDestructured: false }],
    },
  },

  // Plain JavaScript (build scripts, this config, the plugin): no type information. `extends`
  // keeps the rule overrides of disableTypeChecked; a bare spread would be clobbered by `rules`.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      // Same convention as for TypeScript above.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // Every suppression carries its reason (`-- why`), in the library, the demo and the tests.
  {
    files: ["theme/**/*.{ts,tsx}", "demo/**/*.{ts,tsx}"],
    plugins: { sheen },
    rules: { "sheen/require-disable-reason": "error" },
  },

  // The theme library: the AI-friendly doc-comment gate on every exported component / hook.
  {
    files: ["theme/src/**/*.{ts,tsx}"],
    ignores: ["theme/src/index.ts", "theme/src/exports/*.ts"],
    plugins: { sheen },
    rules: {
      // coverAllExports: every other exported symbol (helper, constant, type, interface) needs at
      // least a one-sentence doc comment; the tags and minLength above stay for components and hooks.
      "sheen/require-export-jsdoc": [
        "error",
        { requireTags: ["example", "see"], minLength: 40, coverAllExports: true },
      ],
    },
  },

  // Component code never hard-codes a colour (tokens only). Mask gradients are allowed by the rule.
  {
    files: ["theme/src/components/**/*.{ts,tsx}", "theme/src/blocks/**/*.{ts,tsx}"],
    plugins: { sheen },
    rules: {
      "sheen/no-hardcoded-colors": "error",
    },
  },
  // Text direction is detected in one module (hooks/use-direction.ts): useResolvedDirection and isRtlAt.
  {
    files: ["theme/src/**/*.{ts,tsx}"],
    ignores: ["theme/src/hooks/use-direction.ts"],
    plugins: { sheen },
    rules: { "sheen/no-direction-detection": "error" },
  },
  // Allow-list: the logo / brand marks are fixed artwork, not themed surfaces. The backdrop engines
  // paint canvas gradients (a canvas cannot read CSS variables per stop), and the colour picker
  // produces/parses raw colour values by design.
  {
    files: [
      "theme/src/components/logo/**",
      "theme/src/components/backdrop/**",
      "theme/src/components/color-picker/**",
      "theme/src/blocks/icons.tsx",
    ],
    rules: { "sheen/no-hardcoded-colors": "off" },
  },
  // Internal modules of the analytics kit and of the large split components: exported only so their sibling modules can
  // import them, never part of the public barrel, so they need no public-API doc tags, only a real description.
  {
    files: [
      "theme/src/blocks/analytics/trend-frame.tsx",
      // DataTable's own modules (the component is split by concern; only `DataTable` itself is public).
      "theme/src/components/data-table/{shared,hooks,model}.ts",
      "theme/src/components/data-table/{toolbar,header,rows,pagination,selection,column-menu,states}.tsx",
      // Large components split by concern (the component file keeps the public exports and re-exports the rest).
      "theme/src/components/charts/{gantt,network-graph,geo-map}/**/*.{ts,tsx}",
      "theme/src/components/chat/thread/**/*.{ts,tsx}",
      "theme/src/blocks/ai-chat/**/*.{ts,tsx}",
    ],
    plugins: { sheen },
    rules: { "sheen/require-export-jsdoc": ["error", { requireTags: [], minLength: 0, coverAllExports: true }] },
  },
  // Sibling-module folders created by the file-size split (code quality round I-1): the doc gate stays on for every
  // export (coverAllExports), but these internal modules need no @example / @see tags, only a real description.
  {
    files: [
      "theme/src/**/{histogram,payment-checkout,settings-page,sankey-chart,analytics-finance,notification-center,side-drawer/parts,candlestick-chart,dumbbell-chart,auth-split,conversation-list,calendar/parts,color-picker/parts,diverging-bar-chart,bento-grid,chart-parts,heatmap,drawer/parts,command/parts,cohort-chart,box-plot,lollipop-chart,sunburst-chart,pricing,code-block/parts,gauge-chart,alert-dialog/parts,chord-diagram,category-bar,streamgraph,carousel/parts,file-upload/parts,streaming-chart}/**/*.{ts,tsx}",
    ],
    plugins: { sheen },
    rules: { "sheen/require-export-jsdoc": ["error", { requireTags: [], minLength: 0, coverAllExports: true }] },
  },

  // Production code never imports fixtures: the seeded random helpers and every demo loader live in
  // theme/src/demo-data.ts and theme/src/blocks/analytics/demo*.ts, reachable only from the demo, the tests and each other.
  {
    files: ["theme/src/**/*.{ts,tsx}"],
    ignores: ["theme/src/demo-data.ts", "theme/src/blocks/analytics/demo*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/demo-data",
                "**/demo-data.*",
                "**/analytics/demo",
                "**/analytics/demo-*",
                "./demo",
                "./demo-*",
              ],
              message:
                "Fixtures (demo data, seeded random numbers) must not be imported by production code: take the data from props or `load`.",
            },
          ],
        },
      ],
    },
  },

  // Tests and e2e: Vitest / Playwright globals, no doc-comment gate, looser on floating promises in fixtures.
  {
    files: ["theme/test/**/*.{ts,tsx}", "demo/e2e/**/*.ts", "demo/playwright.config.ts", "theme/vitest.config.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "sheen/require-export-jsdoc": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      // Markup the tests render on purpose: a prop under test (autoFocus), or an element whose
      // content the component under test supplies through `render` (<h1 />, <a />).
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/anchor-has-content": "off",
      // No fixed sleeps in tests: poll observable state (expect.poll / waitFor / findBy*), count frames
      // (`frames(n)`), or wait out a product timer on the frame clock (`holdFor(ms)`), all in test/helpers.ts.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "NewExpression[callee.name='Promise'] CallExpression[callee.name='setTimeout'] > Literal.arguments[value>0]",
          message:
            "Fixed sleep in a test: use expect.poll / waitFor / findBy*, frames(n) or holdFor(ms) from test/helpers.ts.",
        },
      ],
    },
  },

  // File-size limit (code quality round I-1): no source file in theme/src or demo/src over `limit` code
  // lines (blank lines and comments not counted). Files that were already over are listed in
  // eslint.max-lines-allow.json with their current count as a ceiling. THE LIST MAY ONLY SHRINK: split a
  // file and delete its entry; never add a file or raise a count.
  ...maxLinesBlocks(),
);
