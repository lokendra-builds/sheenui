// Shared Vitest setup: real styles, jest-dom matchers, the axe matcher, and a clean <html> per test.
//
// Vitest 5's browser mode already types the jest-dom matchers (`vitest/browser` augments
// `Assertion<R, T>`), while `@testing-library/jest-dom/vitest` still augments the Vitest <= 4
// `Assertion<T>` and clashes with it. So only the runtime matchers are imported (the plain
// `expect(element).toHaveAttribute(...)` form) and only our own axe matcher is typed here.

import "./styles.css";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";

import { axeMatchers } from "./axe";

expect.extend(domMatchers);
expect.extend(axeMatchers);

declare module "vitest" {
  // Module augmentation only works by merging an interface; a type alias cannot extend Vitest's.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- see above: only an interface merges
  interface Assertion<R> {
    /** axe-core results contain no violations (see ./axe.ts). */
    toHaveNoViolations(): R;
  }
}

afterEach(() => {
  cleanup();
  const root = document.documentElement;
  for (const attr of ["data-theme", "data-motion", "data-transparency", "data-glass"]) root.removeAttribute(attr);
  root.setAttribute("data-sheen-style", "liquid");
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});
