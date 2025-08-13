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

type MarketTableProps = {
  rows: Row[]; // <-- explicit prop
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

type SortKey = keyof Row;

export default function MarketTable(props: MarketTableProps) {
  // bind prop to a local so it's always in scope
  const rows = Array.isArray(props.rows) ? props.rows : [];

  const [sortKey, setSortKey] = useState<SortKey>("hr_score");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = (a as any)?.[sortKey];
      const bv = (b as any)?.[sortKey];
      const aNum = typeof av === "number" ? av : -Infinity;
      const bNum = typeof bv === "number" ? bv : -Infinity;
      if (aNum === bNum) return 0;
      return sortDir === "desc" ? (aNum > bNum ? -1 : 1) : (aNum < bNum ? -1 : 1);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function Th({ label, keyName }: { label: string; keyName: SortKey }) {
    const active = sortKey === keyName;
    return (
      <th
        onClick={() => {
          if (active) setSortDir(sortDir === "desc" ? "asc" : "desc");
          else {
            setSortKey(keyName);
            setSortDir("desc");
          }
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
            <Th label="HR %" keyName="hr_game_prob" />
            <Th label="Score (HR)" keyName="hr_score" />
            <Th label="H1 %" keyName="h1_game_prob" />
            <Th label="H2 %" keyName="h2_game_prob" />
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
