// pages/index.tsx
import React from "react";
import MarketTable from "@/components/MarketTable";

type PlayerRow = any;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

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

  const fetchData = React.useCallback(async () => {
    if (!API_BASE) {
      setError("NEXT_PUBLIC_API_BASE not set");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const url = `${API_BASE}/markets?date=${date}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [date]);

  React.useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(id);
  }, [fetchData]);

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
            onClick={fetchData}
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
