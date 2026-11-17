import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevelopmentBuild, resetWarnOnce, warnOnce } from "../../src/lib/warn-once";

describe("warnOnce", () => {
  afterEach(() => {
    resetWarnOnce();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("treats a build as development only when a build tool says so, and unknown as production", () => {
    expect(isDevelopmentBuild(true, undefined)).toBe(true);
    expect(isDevelopmentBuild(false, "development")).toBe(false);
    expect(isDevelopmentBuild(undefined, "development")).toBe(true);
    expect(isDevelopmentBuild(undefined, "production")).toBe(false);
    expect(isDevelopmentBuild(undefined, undefined)).toBe(false);
  });

  it("prints each message once in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnOnce("same");
    warnOnce("same");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith("[SheenUI] same");
  });

  it("is silent when the bundler reports a production build", () => {
    vi.stubEnv("DEV", false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnOnce("quiet");
    expect(warn).not.toHaveBeenCalled();
  });
});
