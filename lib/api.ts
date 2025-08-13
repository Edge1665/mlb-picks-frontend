// lib/api.ts
export async function fetchMarkets() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/markets`);
  if (!res.ok) {
    throw new Error(`Failed to fetch markets: ${res.statusText}`);
  }
  // Pass through the entire backend JSON so new fields like hr_game_prob come through
  return res.json();
}
