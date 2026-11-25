export type CsvValue = string | number | boolean | Date | null | undefined;

const NEEDS_QUOTES = /[",\r\n]|^\s|\s$/;
const FORMULA_START = /^[=+\-@\t\r]/;

/** One CSV field: quoted when it holds a comma, quote or line break, and defanged against spreadsheet formula injection. */
export function escapeCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "true" : "false";
  let text = value instanceof Date ? value.toISOString() : value;
  if (FORMULA_START.test(text)) text = `'${text}`;
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Build a CSV document (CRLF line endings) from a header row and data rows. */
export function toCsv(headers: string[], rows: CsvValue[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
}

/** Save a Blob as a file through a temporary link. The one download implementation: CSV, SVG and PNG exports all use it. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke later: Safari needs the URL alive while the download starts.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download text as a .csv file. Adds a BOM so Excel reads UTF-8 (₹, é, …) correctly. */
export function downloadCsv(filename: string, csv: string) {
  const name = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`;
  downloadBlob(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), name);
}

/** Download rows as a CSV file: a header row plus data rows (UTF-8 with BOM, quoted and formula-safe). */
export function exportCsv(filename: string, headers: string[], rows: CsvValue[][]) {
  downloadCsv(filename, toCsv(headers, rows));
}
