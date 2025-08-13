// pages/index.tsx
import React, { useEffect, useState } from "react";
import { fetchMarkets } from "../lib/api";
import MarketTable from "../components/MarketTable";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    setDate(iso);
  }, []);

  useEffect(() => {
    if (!date) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMarkets(date);
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">MLB Picks – HR & Hits</h1>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        {loading && <span className="text-sm">Fetching markets…</span>}
        {error && <span className="text-sm text-red-600">Error: {error}</span>}
      </div>
      <MarketTable rows={rows} />
      <p className="text-xs text-neutral-500 mt-3">
        Score (HR) = model probability × confidence + market edge (capped), scaled to 1.0–10.0.
        Model includes pitcher matchup, park factors, recent form and weather.
      </p>
    </main>
  );
}
