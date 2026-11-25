// `expect(results).toHaveNoViolations()` on axe-core results, for Vitest browser mode.
// (vitest-axe wraps axe for Node/jsdom and needs `createRequire`, which a real browser lacks.)

import axeCore, { type AxeResults, type Result, type RunOptions } from "axe-core";

/** Run axe on an element (default: the whole document, so portals are included). */
export function axe(context: Element | Document = document, options: RunOptions = {}): Promise<AxeResults> {
  return axeCore.run(context, options);
}

function describeViolation(v: Result) {
  const nodes = v.nodes
    .map((n) => `    ${n.target.join(" ")}\n      ${n.failureSummary?.replace(/\n/g, "\n      ") ?? ""}`)
    .join("\n");
  return `  [${v.impact ?? "unknown"}] ${v.id}: ${v.help} (${v.helpUrl})\n${nodes}`;
}

export const axeMatchers = {
  toHaveNoViolations(received: AxeResults) {
    const violations = received.violations;
    const pass = violations.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? "Expected axe violations, found none."
          : `Expected no axe violations, found ${violations.length}:\n${violations.map(describeViolation).join("\n")}`,
    };
  },
};
