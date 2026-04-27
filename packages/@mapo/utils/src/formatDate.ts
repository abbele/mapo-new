const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(date: string | Date, format = "YYYY-MM-DD"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return format
    .replace("YYYY", String(d.getFullYear()))
    .replace("MM", pad(d.getMonth() + 1))
    .replace("DD", pad(d.getDate()))
    .replace("HH", pad(d.getHours()))
    .replace("mm", pad(d.getMinutes()))
    .replace("ss", pad(d.getSeconds()));
}
