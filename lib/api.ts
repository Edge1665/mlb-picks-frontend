// lib/api.ts
export async function fetchMarkets(date?: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  const url = `${base}/markets${date ? `?date=${date}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  return await res.json(); // array of rows; includes hr_score
}
