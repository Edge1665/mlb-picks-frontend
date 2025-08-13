// pages/index.tsx
import React from "react";
import MarketTable from "../components/MarketTable";
import { fetchMarkets } from "../lib/api";

type PlayerRow = any;

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HomePage() {
  const [rows, setRows] = React.useState<PlayerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [date, setDate] = React.useState(isoToday());
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMarkets(date);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(id);
  }, [load]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">MLB Picks</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            onClick={load}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Fetching markets…</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-600">No data for this date.</div>
      ) : (
        <MarketTable rows={rows} />
      )}
    </main>
  );
}
