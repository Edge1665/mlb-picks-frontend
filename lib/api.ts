// lib/api.ts
export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE is not set");
  return base.replace(/\/+$/, ""); // strip trailing slashes
}

export async function fetchMarkets(dateISO: string) {
  const base = getApiBase();
  const res = await fetch(`${base}/markets?date=${encodeURIComponent(dateISO)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Backend HTTP ${res.status}`);
  }
  return res.json();
}
