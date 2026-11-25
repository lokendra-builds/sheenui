declare const process: { env?: { NODE_ENV?: string } } | undefined;

/**
 * Decide whether this is a development build from the two signals a build tool can provide. Pure, so the
 * decision is testable; unknown means production.
 */
export function isDevelopmentBuild(viteDev: boolean | undefined, nodeEnv: string | undefined): boolean {
  if (typeof viteDev === "boolean") return viteDev;
  if (nodeEnv !== undefined) return nodeEnv !== "production";
  return false;
}

const seen = new Set<string>();

/** Print `message` through `console.warn` once per page load, in development builds only. */
export function warnOnce(message: string): void {
  const nodeEnv = typeof process !== "undefined" ? process.env?.NODE_ENV : undefined;
  // The literal `import.meta.env` is what Vite and compatible bundlers replace; this package has no Vite types of its own.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ts-expect-error would fail wherever vite/client types exist
  // @ts-ignore -- ImportMeta.env exists only with vite/client types
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- typed only where vite/client types exist
  const viteDev: boolean | undefined = import.meta.env?.DEV;
  if (!isDevelopmentBuild(viteDev, nodeEnv)) return;
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(`[SheenUI] ${message}`);
}

/** Forget every message already printed. For tests. */
export function resetWarnOnce(): void {
  seen.clear();
}
