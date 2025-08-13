// components/MarketTable.tsx
import React, { useMemo, useState } from "react";

type Row = {
  playerName: string;
  team: string;
  lineupSpot?: number | null;

  hr_game_prob?: number;
  h1_game_prob?: number;
  h2_game_prob?: number;

  hr_market_odds?: number | null;
  h1_market_odds?: number | null;
  h2_market_odds?: number | null;

  hr_score?: number; // 1.0 - 10.0
};

function pct(x?: number) {
  if (typeof x !== "number") return "—";
  return `${(x * 100).toFixed(1)}%`;
}
function dec(x?: number) {
  if (typeof x !== "number") return "—";
  return x.toFixed(1);
}
function odds(x?: number | null) {
  if (x === null || typeof x === "undefined") return "—";
  const v = Number(x);
  return v > 0 ? `+${v}` : `${v}`;
}

export default function MarketTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<keyof Row>("hr_score");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a: any, b: any) => {
      const av = a?.[sortKey] ?? -Infinity;
      const bv = b?.[sortKey] ?? -Infinity;
      if (av === bv) return 0;
      return sortDir === "desc" ? (av > bv ? -1 : 1) : (av < bv ? -1 : 1);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function th(label: string, key: keyof Row) {
    const active = sortKey === key;
    return (
      <th
        onClick={() => {
          if (active) setSortDir(sortDir === "desc" ? "asc" : "desc");
          else { setSortKey(key); setSortDir("desc"); }
        }}
        style={{ cursor: "pointer", whiteSpace: "nowrap" }}
      >
        {label} {active ? (sortDir === "desc" ? "▼" : "▲") : ""}
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Player</th>
            <th>Team</th>
            <th>Lineup</th>
            {th("HR %", "hr_game_prob")}
            {th("Score (HR)", "hr_score")}
            {th("H1 %", "h1_game_prob")}
            {th("H2 %", "h2_game_prob")}
            <th>Odds HR</th>
            <th>Odds 1+H</th>
            <th>Odds 2+H</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className="border-b last:border-none">
              <td>{r.playerName}</td>
              <td>{r.team}</td>
              <td>{r.lineupSpot ?? "—"}</td>
              <td>{pct(r.hr_game_prob)}</td>
              <td><b>{dec(r.hr_score)}</b></td>
              <td>{pct(r.h1_game_prob)}</td>
              <td>{pct(r.h2_game_prob)}</td>
              <td>{odds(r.hr_market_odds)}</td>
              <td>{odds(r.h1_market_odds)}</td>
              <td>{odds(r.h2_market_odds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
  const [sortKey, setSortKey] = React.useState<keyof Row>("hr_score");
  const [asc, setAsc] = React.useState<boolean>(false);

  const sorted = React.useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = (a[sortKey] as any) ?? -Infinity;
      const bv = (b[sortKey] as any) ?? -Infinity;
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, asc]);

  const getProb = (r: Row, key: "hr" | "h1" | "h2") => {
    if (key === "hr") return (r.hr_game_prob ?? r.hr_anytime_prob) ?? null;
    if (key === "h1") return (r.h1_game_prob ?? r.hits_1plus_prob) ?? null;
    return (r.h2_game_prob ?? r.hits_2plus_prob) ?? null;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 p-3 text-sm">
        <span className="text-gray-600">Sort by:</span>
        <select
          className="rounded-md border border-gray-300 px-2 py-1"
          value={String(sortKey)}
          onChange={(e) => setSortKey(e.target.value as keyof Row)}
        >
          <option value="hr_score">HR Score</option>
          <option value="h1_score">1+ Hit Score</option>
          <option value="h2_score">2+ Hits Score</option>
          <option value="hr_game_prob">HR %</option>
          <option value="h1_game_prob">1+ Hit %</option>
          <option value="h2_game_prob">2+ Hits %</option>
          <option value="hr_edge">HR Edge</option>
          <option value="h1_edge">1+ Hit Edge</option>
          <option value="h2_edge">2+ Hits Edge</option>
        </select>
        <button
          className="rounded-md border border-gray-300 px-2 py-1"
          onClick={() => setAsc((v) => !v)}
          title="Toggle ascending/descending"
        >
          {asc ? "Asc" : "Desc"}
        </button>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2">Player</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">Spot</th>

            <th className="px-3 py-2">HR %</th>
            <th className="px-3 py-2">1+ Hit %</th>
            <th className="px-3 py-2">2+ Hits %</th>

            <th className="px-3 py-2">Fair HR</th>
            <th className="px-3 py-2">Fair 1+</th>
            <th className="px-3 py-2">Fair 2+</th>

            <th className="px-3 py-2">Mkt HR</th>
            <th className="px-3 py-2">Mkt 1+</th>
            <th className="px-3 py-2">Mkt 2+</th>

            <th className="px-3 py-2">Edge HR</th>
            <th className="px-3 py-2">Edge 1+</th>
            <th className="px-3 py-2">Edge 2+</th>

            <th className="px-3 py-2">Score HR</th>
            <th className="px-3 py-2">Score 1+</th>
            <th className="px-3 py-2">Score 2+</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const hr = getProb(r, "hr");
            const h1 = getProb(r, "h1");
            const h2 = getProb(r, "h2");
            return (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-3 py-2 font-medium">{r.playerName}</td>
                <td className="px-3 py-2">{r.team || "—"}</td>
                <td className="px-3 py-2">{r.lineupSpot ?? "—"}</td>

                <td className="px-3 py-2">{pct(hr)}</td>
                <td className="px-3 py-2">{pct(h1)}</td>
                <td className="px-3 py-2">{pct(h2)}</td>

                <td className="px-3 py-2">{odds(r.fair_hr_american)}</td>
                <td className="px-3 py-2">{odds(r.fair_h1_american)}</td>
                <td className="px-3 py-2">{odds(r.fair_h2_american)}</td>

                <td className="px-3 py-2">{odds(r.hr_market_odds)}</td>
                <td className="px-3 py-2">{odds(r.h1_market_odds)}</td>
                <td className="px-3 py-2">{odds(r.h2_market_odds)}</td>

                <td className="px-3 py-2">{fmtEdge(r.hr_edge)}</td>
                <td className="px-3 py-2">{fmtEdge(r.h1_edge)}</td>
                <td className="px-3 py-2">{fmtEdge(r.h2_edge)}</td>

                <td className="px-3 py-2">{score(r.hr_score)}</td>
                <td className="px-3 py-2">{score(r.h1_score)}</td>
                <td className="px-3 py-2">{score(r.h2_score)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
