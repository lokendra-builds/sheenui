// Shared by the scripts: skip macOS AppleDouble metadata (`._*`), which external drives and archives leave next to real files.

/** True for a `._*` AppleDouble file name (a bare name, not a path). */
export const isAppleDouble = (name) => name.startsWith("._");

/** `readdirSync` names (or Dirents) without the `._*` metadata files. */
export const withoutAppleDouble = (entries) =>
  entries.filter((e) => !isAppleDouble(typeof e === "string" ? e : e.name));
