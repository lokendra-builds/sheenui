export function initials(name: string, pick: "first-two" | "first-last" = "first-two"): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const chosen = pick === "first-last" && words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 2);
  return chosen
    .map((word) => word?.[0] ?? "")
    .join("")
    .toUpperCase();
}
