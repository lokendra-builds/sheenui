// Render helpers: every component test runs in the light + dark × Liquid + Aurora matrix,
// inside the app-level MotionConfig, with axe run against the real DOM.

import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { describe } from "vitest";
import type { AxeResults, RunOptions } from "axe-core";

import { axe } from "./axe";

import { SheenMotionProvider } from "../src/motion/provider";
import type { SheenStyle } from "../src/hooks/use-preferences";

export type Theme = "light" | "dark";
export type Variant = { theme: Theme; style: SheenStyle };

/** The four looks every component must pass in. */
export const variants: Variant[] = [
  { theme: "light", style: "liquid" },
  { theme: "dark", style: "liquid" },
  { theme: "light", style: "aurora" },
  { theme: "dark", style: "aurora" },
];

/** Sets the preference attributes on <html> exactly as sheenPreferenceScript would. */
export function applyVariant({ theme, style }: Variant) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-sheen-style", style);
}

function Providers({ children }: { children: ReactNode }) {
  return <SheenMotionProvider>{children}</SheenMotionProvider>;
}

/** Render inside the motion provider, in the given look (default: light Liquid). */
export function renderUi(
  ui: ReactElement,
  variant: Variant = variants[0]!,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  applyVariant(variant);
  return render(ui, { wrapper: Providers, ...options });
}

/** `describe` once per look: `describeVariants((variant) => { it(...) })`. */
export function describeVariants(body: (variant: Variant) => void) {
  describe.each(variants)("$theme / $style", body);
}

/**
 * axe on the whole document (portals included). Region checks are off: a test renders a
 * fragment, not a page, so there is no main landmark to land in.
 */
export function runAxe(container: Element = document.body, options?: RunOptions): Promise<AxeResults> {
  return axe(container, {
    rules: { region: { enabled: false } },
    ...options,
  });
}
