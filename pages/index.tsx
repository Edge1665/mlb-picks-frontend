// pages/index.tsx
import React from "react";
import { fetchMarkets } from "../lib/api"; // NOTE: relative path

type PlayerRow = any;

export default function Home() {
  const [rows, setRows] = React.useState<PlayerRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [date, setDate] = React.useState<string>("");

  React.useEffect(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    setDate(iso);
  }, []);

  React.useEffect(() => {
    if (!date) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMarkets(date); // accepts optional date
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  return (
    <main className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">MLB Picks</h1>

      <div className="mt-3 flex items-center gap-2">
        <label className="text-sm text-gray-600">Date:</label>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {loading && <span className="text-sm text-gray-500">Fetching markets…</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <div className="mt-4">
        <table className="min-w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-left">Spot</th>
              <th className="px-3 py-2 text-left">HR %</th>
              <th className="px-3 py-2 text-left">1+ Hit %</th>
              <th className="px-3 py-2 text-left">2+ Hits %</th>
              <th className="px-3 py-2 text-left">Fair HR</th>
              <th className="px-3 py-2 text-left">Fair 1+</th>
              <th className="px-3 py-2 text-left">Fair 2+</th>
              <th className="px-3 py-2 text-left">Score HR</th>
              <th className="px-3 py-2 text-left">Score 1+</th>
              <th className="px-3 py-2 text-left">Score 2+</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => {
              const hr = r.hr_game_prob ?? r.hr_anytime_prob ?? null;
              const h1 = r.h1_game_prob ?? r.hits_1plus_prob ?? null;
              const h2 = r.h2_game_prob ?? r.hits_2plus_prob ?? null;
              const pct = (n: number | null) =>
                n == null ? "—" : `${(n * 100).toFixed(1)}%`;
              const odds = (n: number | null | undefined) =>
                n == null ? "—" : n > 0 ? `+${n}` : `${n}`;
              const score = (n: number | null | undefined) =>
                n == null ? "—" : n.toFixed(1);

              return (
                <tr key={`${r.playerId}-${i}`} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-2 font-medium">{r.playerName}</td>
                  <td className="px-3 py-2">{r.team || "—"}</td>
                  <td className="px-3 py-2">{r.lineupSpot ?? "—"}</td>

                  <td className="px-3 py-2">{pct(hr)}</td>
                  <td className="px-3 py-2">{pct(h1)}</td>
                  <td className="px-3 py-2">{pct(h2)}</td>

                  <td className="px-3 py-2">{odds(r.fair_hr_american)}</td>
                  <td className="px-3 py-2">{odds(r.fair_h1_american)}</td>
                  <td className="px-3 py-2">{odds(r.fair_h2_american)}</td>

                  <td className="px-3 py-2">{score(r.hr_score)}</td>
                  <td className="px-3 py-2">{score(r.h1_score)}</td>
                  <td className="px-3 py-2">{score(r.h2_score)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
