// lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function fetchMarkets(date: string) {
  const url = new URL(`${API_BASE}/markets`);
  url.searchParams.set("date", date);
  // ensure we always see everyone even if lineups aren’t posted yet
  url.searchParams.set("includeFallback", "true");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const data = await res.json();
  return data;
}
