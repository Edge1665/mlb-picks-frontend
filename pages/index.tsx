// pages/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchMarkets } from "../lib/api";
import AuthGate from "../components/AuthGate";
import MarketTable from "../components/MarketTable";
import Header from "../components/Header";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [date, setDate] = useState<string>("");
  const [query, setQuery] = useState("");
  const [onlyStarters, setOnlyStarters] = useState(false);
  const [topN, setTopN] = useState(200);
  const [topPicksOnly, setTopPicksOnly] = useState(false);
  const [topPickThreshold, setTopPickThreshold] = useState(8.0); // default: show >=8.0

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

  // Frontend filtering layer (keeps the “HUGE list” manageable)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = rows;
    if (onlyStarters) r = r.filter((x) => x.lineupSpot && x.lineupSpot > 0);
    if (q) {
      r = r.filter((x) =>
        x.playerName?.toLowerCase().includes(q) || x.team?.toLowerCase().includes(q)
      );
    }
    if (topPicksOnly) {
      r = r.filter(
        (x) =>
          (typeof x.hr_score === "number" && x.hr_score >= topPickThreshold) ||
          (typeof x.h1_score === "number" && x.h1_score >= topPickThreshold) ||
          (typeof x.h2_score === "number" && x.h2_score >= topPickThreshold)
      );
    }
    return r.slice(0, topN);
  }, [rows, query, onlyStarters, topN, topPicksOnly, topPickThreshold]);

  const totals = useMemo(() => {
    const n = rows.length;
    const withOdds = rows.filter((r) => r.hr_market_odds != null || r.h1_market_odds != null || r.h2_market_odds != null).length;
    return { n, withOdds };
  }, [rows]);

  return (
    <AuthGate>
      <Header
        date={date}
        onDate={setDate}
        query={query}
        onQuery={setQuery}
        onlyStarters={onlyStarters}
        onOnlyStarters={setOnlyStarters}
        topN={topN}
        onTopN={setTopN}
        topPicksOnly={topPicksOnly}
        onTopPicksOnly={setTopPicksOnly}
        topPickThreshold={topPickThreshold}
        onTopPickThreshold={setTopPickThreshold}
      />

      <main className="max-w-6xl mx-auto px-4 py-4">
        {/* Status */}
        <div className="flex items-center gap-3 text-sm mb-3 text-neutral-600 dark:text-neutral-300">
          {loading && <span>Fetching markets…</span>}
          {error && <span className="text-red-600">Error: {error}</span>}
          {!loading && !error && (
            <span>
              {totals.n} players · {totals.withOdds} with market odds
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-300">
            Tip: Click a column header to sort. “Score (HR/1+H/2+H)” is 1.0–10.0 from model & (when available) market edge.
          </div>
          <div className="p-3 overflow-x-auto">
            <MarketTable rows={filtered} />
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
