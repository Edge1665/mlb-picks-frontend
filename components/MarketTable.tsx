// components/MarketTable.tsx
import React from "react";

type PlayerRow = {
  date: string;
  playerId: number;
  playerName: string;
  team: string;
  lineupSpot?: number | null;

  hr_anytime_prob: number;
  hits_1plus_prob: number;
  hits_2plus_prob: number;

  fair_hr_american: number | null;
  fair_h1_american: number | null;
  fair_h2_american: number | null;

  hr_market_odds: number | null;
  h1_market_odds: number | null;
  h2_market_odds: number | null;

  hr_market_prob: number | null;
  h1_market_prob: number | null;
  h2_market_prob: number | null;

  hr_edge: number | null;
  h1_edge: number | null;
  h2_edge: number | null;

  hr_score: number;
  h1_score: number;
  h2_score: number;

  recent_pa?: number;
};

type Market = "H1" | "H2" | "HR";

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function odds(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v}`;
}

function valueBadge(edge: number | null | undefined): JSX.Element | null {
  if (edge == null) return null;
  const edgePct = edge * 100;
  if (edgePct >= 1.0) {
    return (
      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
        Value +{edgePct.toFixed(1)}%
      </span>
    );
  }
  if (edgePct <= -1.0) {
    return (
      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        -{Math.abs(edgePct).toFixed(1)}%
      </span>
    );
  }
  return null;
}

function marketFields(market: Market) {
  if (market === "H1") {
    return {
      label: "1+ Hit",
      modelProbKey: "hits_1plus_prob" as const,
      marketOddsKey: "h1_market_odds" as const,
      fairOddsKey: "fair_h1_american" as const,
      marketProbKey: "h1_market_prob" as const,
      edgeKey: "h1_edge" as const,
      scoreKey: "h1_score" as const,
    };
  }
  if (market === "H2") {
    return {
      label: "2+ Hits",
      modelProbKey: "hits_2plus_prob" as const,
      marketOddsKey: "h2_market_odds" as const,
      fairOddsKey: "fair_h2_american" as const,
      marketProbKey: "h2_market_prob" as const,
      edgeKey: "h2_edge" as const,
      scoreKey: "h2_score" as const,
    };
  }
  // HR
  return {
    label: "HR Anytime",
    modelProbKey: "hr_anytime_prob" as const,
    marketOddsKey: "hr_market_odds" as const,
    fairOddsKey: "fair_hr_american" as const,
    marketProbKey: "hr_market_prob" as const,
    edgeKey: "hr_edge" as const,
    scoreKey: "hr_score" as const,
  };
}

type Props = {
  rows: PlayerRow[];
};

export default function MarketTable({ rows }: Props) {
  const [market, setMarket] = React.useState<Market>("H1");
  const [sortKey, setSortKey] = React.useState<string>("score");
  const [sortDir, setSortDir] = React.useState<"desc" | "asc">("desc");
  const [query, setQuery] = React.useState("");

  const f = marketFields(market);

  const displayRows = React.useMemo(() => {
    let data = rows;

    // filter by name/team
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.playerName.toLowerCase().includes(q) ||
          (r.team || "").toLowerCase().includes(q)
      );
    }

    // compute sort value
    const getSortVal = (r: PlayerRow) => {
      if (sortKey === "score") return r[f.scoreKey];
      if (sortKey === "model") return r[f.modelProbKey];
      if (sortKey === "edge") return r[f.edgeKey] ?? -999;
      if (sortKey === "market") return r[f.marketProbKey] ?? -999;
      if (sortKey === "fair") return r[f.fairOddsKey] ?? 999999; // just to group
      if (sortKey === "pa") return r.recent_pa ?? 0;
      return r[f.scoreKey];
    };

    const sorted = [...data].sort((a, b) => {
      const va = getSortVal(a);
      const vb = getSortVal(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === "desc" ? (vb as number) - (va as number) : (va as number) - (vb as number);
    });

    return sorted;
  }, [rows, market, sortKey, sortDir, query]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Market:</label>
          <div className="flex items-center gap-2">
            {(["H1", "H2", "HR"] as Market[]).map((m) => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium border ${
                  market === m
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {m === "H1" ? "1+ Hit" : m === "H2" ? "2+ Hits" : "HR"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Sort by:</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="score">Score (1–10)</option>
            <option value="model">Model %</option>
            <option value="edge">Edge % (vs Market)</option>
            <option value="market">Market % (implied)</option>
            <option value="fair">Fair Odds (model)</option>
            <option value="pa">Recent PA (30d)</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            title="Toggle sort direction"
          >
            {sortDir === "desc" ? "↓" : "↑"}
          </button>
        </div>

        <div className="flex-1 sm:flex-none">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search player or team…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-center">Lineup</th>
              <th className="px-3 py-2 text-right">Model %</th>
              <th className="px-3 py-2 text-right">Market Odds</th>
              <th className="px-3 py-2 text-right">Fair Odds</th>
              <th className="px-3 py-2 text-right">Edge</th>
              <th className="px-3 py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => {
              const fields = marketFields(market);
              const modelP = r[fields.modelProbKey] as number;
              const marketOdds = r[fields.marketOddsKey] as number | null;
              const fairOdds = r[fields.fairOddsKey] as number | null;
              const marketProb = r[fields.marketProbKey] as number | null;
              const edge = r[fields.edgeKey] as number | null;
              const score = r[fields.scoreKey] as number;

              return (
                <tr key={`${r.playerId}-${fields.label}`} className="border-t">
                  <td className="px-3 py-2">{r.playerName}</td>
                  <td className="px-3 py-2">{r.team || "—"}</td>
                  <td className="px-3 py-2 text-center">{r.lineupSpot ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{pct(modelP)}</td>
                  <td className="px-3 py-2 text-right">{odds(marketOdds)}</td>
                  <td className="px-3 py-2 text-right">{fairOdds == null ? "—" : odds(fairOdds)}</td>
                  <td className="px-3 py-2 text-right">
                    {marketProb == null || edge == null ? "—" : `${(edge * 100).toFixed(1)}%`}
                    {valueBadge(edge)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{score.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Model % = per-game probability from your model. Market Odds are American odds from books. Fair Odds = model’s implied American odds.
        Edge = (Model % − Market %) when market is available. Score blends probability, confidence (recent PA), and market edge.
      </p>
    </div>
  );
}

