export function cssTimeToMs(value: string): number {
  const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/i.exec(value);
  if (!match) return Number.NaN;
  const [, amount = "", unit = ""] = match;
  const n = Number(amount);
  return unit.toLowerCase() === "s" ? n * 1000 : n;
}
