// pages/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchMarkets } from "../lib/api";
import AuthGate from "../components/AuthGate";
import MarketTable from "../components/MarketTable";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    setDate(today.toISOString().slice(0, 10));
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

  const totals = useMemo(() => {
    const n = rows.length;
    const withOdds = rows.filter((r) => r.hr_market_odds != null).length;
    return { n, withOdds };
  }, [rows]);

  return (
    <AuthGate>
      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Today’s Picks</h1>
            <p className="text-sm text-neutral-500">HR, 1+H, 2+H with model score.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 text-sm mb-3">
          {loading && <span>Fetching markets…</span>}
          {error && <span className="text-red-600">Error: {error}</span>}
          {!loading && !error && (
            <span className="text-neutral-500">
              {totals.n} players · {totals.withOdds} with market odds
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white">
          <div className="p-3 border-b text-sm text-neutral-600">
            Tip: Click a column header to sort. “Score (HR)” is 1.0–10.0 based on model & market edge.
          </div>
          <div className="p-3 overflow-x-auto">
            <MarketTable rows={rows} />
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
