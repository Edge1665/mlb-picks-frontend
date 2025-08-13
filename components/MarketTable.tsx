// components/MarketTable.tsx
import React, { useMemo, useState } from "react";

type Row = {
  playerName: string;
  team: string;
  lineupSpot?: number | null;

  // model probabilities from backend (0..1)
  hr_game_prob?: number;
  h1_game_prob?: number;
  h2_game_prob?: number;

  // market odds (American) if present; can be null
  hr_market_odds?: number | null;
  h1_market_odds?: number | null;
  h2_market_odds?: number | null;

  // backend may send a precomputed score; we’ll compute client-side if missing
  hr_score?: number;
  h1_score?: number;
  h2_score?: number;
};

type MarketTableProps = {
  rows: Row[];
};

// -------- helpers --------
function pct(x?: number) {
  if (typeof x !== "number") return "—";
  return `${(x * 100).toFixed(1)}%`;
}
function dec(x?: number) {
  if (typeof x !== "number") return "—";
  return x.toFixed(1);
}
function oddsFmt(x?: number | null) {
  if (x === null || typeof x === "undefined") return "—";
  const v = Number(x);
  return v > 0 ? `+${v}` : `${v}`;
}

// convert American odds to implied probability (vig not removed)
function impliedFromAmerican(american: number): number | null {
  if (american == null) return null;
  if (american >= 100) return 100 / (american + 100);
  if (american <= -100) return -american / (-american + 100);
  return null;
}

// smooth scaling 0..1 → 1..10 that rewards higher confidence but avoids all-10s
function scoreFromProb(prob?: number, marketAmerican?: number | null) {
  if (typeof prob !== "number") return 1.0;

  // base score: non-linear emphasis on strong edges
  const base = Math.pow(prob, 0.6); // gentle curve; 0.2→0.38, 0.3→0.49, 0.4→0.58, 0.5→0.66, 0.7→0.82

  // optional market adjustment if we have odds
  let adj = 0;
  const imp = impliedFromAmerican(marketAmerican ?? null);
  if (imp != null) {
    // edge = model - implied; cap contribution so bad feeds don’t blow up
    const edge = Math.max(-0.25, Math.min(0.25, prob - imp)); // cap ±25pp
    // scale edge into a small bump (roughly ±1.5 points max)
    adj = edge * 6; // 0.25*6 = 1.5
  }

  const raw = 1 + base * 8 + adj; // base 1..9 + adj
  return Math.max(1.0, Math.min(10.0, raw));
}

type SortKey =
  | "playerName"
  | "team"
  | "lineupSpot"
  | "hr_game_prob"
  | "h1_game_prob"
  | "h2_game_prob"
  | "hr_score"
  | "h1_score"
  | "h2_score";

export default function MarketTable(props: MarketTableProps) {
  const all = Array.isArray(props.rows) ? props.rows : [];

  // ------- local filters (makes the huge list manageable) -------
  const [query, setQuery] = useState("");
  const [onlyStarters, setOnlyStarters] = useState(false);
  const [topN, setTopN] = useState<number>(200); // show more/less rows

  // ------- sorting -------
  const [sortKey, setSortKey] = useState<SortKey>("hr_score");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // derive client-side scores if backend didn’t send them
  const enriched = useMemo<Row[]>(() => {
    return all.map((r) => {
      const hrScore =
        typeof r.hr_score === "number"
          ? r.hr_score
          : scoreFromProb(r.hr_game_prob, r.hr_market_odds);
      const h1Score =
        typeof r.h1_score === "number"
          ? r.h1_score
          : scoreFromProb(r.h1_game_prob, r.h1_market_odds);
      const h2Score =
        typeof r.h2_score === "number"
          ? r.h2_score
          : scoreFromProb(r.h2_game_prob, r.h2_market_odds);
      return { ...r, hr_score: hrScore, h1_score: h1Score, h2_score: h2Score };
    });
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((r) => {
      if (onlyStarters && !(r.lineupSpot && r.lineupSpot > 0)) return false;
      if (!q) return true;
      return (
        r.playerName?.toLowerCase().includes(q) ||
        r.team?.toLowerCase().includes(q)
      );
    });
  }, [enriched, query, onlyStarters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = (a as any)?.[sortKey];
      const bv = (b as any)?.[sortKey];
      const aNum = typeof av === "number" ? av : av?.toString?.().toLowerCase?.() ?? "";
      const bNum = typeof bv === "number" ? bv : bv?.toString?.().toLowerCase?.() ?? "";
      if (aNum === bNum) return 0;
      const cmp = aNum > bNum ? 1 : -1;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return copy.slice(0, topN);
  }, [filtered, sortKey, sortDir, topN]);

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
        className="cursor-pointer whitespace-nowrap"
      >
        {label} {active ? (sortDir === "desc" ? "▼" : "▲") : ""}
      </th>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <input
          placeholder="Search player or team"
          className="border rounded px-2 py-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={onlyStarters}
            onChange={(e) => setOnlyStarters(e.target.checked)}
          />
          Only starters
        </label>
        <label className="flex items-center gap-2">
          Show
          <select
            className="border rounded px-2 py-1"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            {[50, 100, 200, 500, 1000].map((n) => (
              <option key={n} value={n}>
                Top {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <Th label="Player" keyName="playerName" />
              <Th label="Team" keyName="team" />
              <Th label="Lineup" keyName="lineupSpot" />
              <Th label="HR %" keyName="hr_game_prob" />
              <Th label="Score (HR)" keyName="hr_score" />
              <Th label="1+H %" keyName="h1_game_prob" />
              <Th label="Score (1+H)" keyName="h1_score" />
              <Th label="2+H %" keyName="h2_game_prob" />
              <Th label="Score (2+H)" keyName="h2_score" />
              <th>Odds HR</th>
              <th>Odds 1+H</th>
              <th>Odds 2+H</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="whitespace-nowrap">{r.playerName}</td>
                <td>{r.team}</td>
                <td>{r.lineupSpot ?? "—"}</td>
                <td>{pct(r.hr_game_prob)}</td>
                <td><b>{dec(r.hr_score)}</b></td>
                <td>{pct(r.h1_game_prob)}</td>
                <td><b>{dec(r.h1_score)}</b></td>
                <td>{pct(r.h2_game_prob)}</td>
                <td><b>{dec(r.h2_score)}</b></td>
                <td>{oddsFmt(r.hr_market_odds)}</td>
                <td>{oddsFmt(r.h1_market_odds)}</td>
                <td>{oddsFmt(r.h2_market_odds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
