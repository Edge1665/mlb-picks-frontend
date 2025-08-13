// lib/api.ts
export async function fetchMarkets(date?: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE is not set");

  const url = new URL("/markets", base);
  if (date) url.searchParams.set("date", date); // YYYY-MM-DD

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch markets: ${res.status} ${res.statusText}`);
  }
  return res.json(); // pass through all fields (hr_game_prob, etc.)
}
