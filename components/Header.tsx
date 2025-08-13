// components/Header.tsx
import React, { useEffect, useRef, useState } from "react";

type Props = {
  date: string;
  onDate: (d: string) => void;
  query: string;
  onQuery: (q: string) => void;
  onlyStarters: boolean;
  onOnlyStarters: (v: boolean) => void;
  topN: number;
  onTopN: (n: number) => void;
  topPicksOnly: boolean;
  onTopPicksOnly: (v: boolean) => void;
  topPickThreshold: number; // 1..10
  onTopPickThreshold: (v: number) => void;
};

export default function Header(props: Props) {
  const {
    date, onDate,
    query, onQuery,
    onlyStarters, onOnlyStarters,
    topN, onTopN,
    topPicksOnly, onTopPicksOnly,
    topPickThreshold, onTopPickThreshold,
  } = props;

  // --- Dark mode toggle ---
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // --- “Install App” button (PWA) ---
  const deferredPrompt = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  async function handleInstall() {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        {/* Brand + controls left */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center font-bold">MLB</div>
          <div className="leading-tight">
            <div className="text-sm text-neutral-700 dark:text-neutral-200">Picks Dashboard</div>
            <div className="text-[11px] text-neutral-500">HR, 1+H, 2+H • sortable</div>
          </div>
        </div>

        {/* Controls right */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="border dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <input
            placeholder="Search player or team"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            className="border dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <label className="text-sm flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={onlyStarters}
              onChange={(e) => onOnlyStarters(e.target.checked)}
            /> Starters
          </label>
          // in components/Header.tsx, replace the "Show" <select> block with this:
<label className="text-sm flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
  Show
  <select
    className="border dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1"
    value={topN}
    onChange={(e) => onTopN(Number(e.target.value))}
  >
    <option value={-1}>All</option>
    {[50, 100, 200, 500, 1000].map((n) => (
      <option key={n} value={n}>Top {n}</option>
    ))}
  </select>
</label>


          {/* Top picks toggle + threshold */}
          <label className="text-sm flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={topPicksOnly}
              onChange={(e) => onTopPicksOnly(e.target.checked)}
            /> Top Picks
          </label>
          <div className="flex items-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
            ≥
            <input
              type="number"
              step="0.1"
              min={1}
              max={10}
              value={topPickThreshold}
              onChange={(e) => onTopPickThreshold(Number(e.target.value))}
              className="w-16 border dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1"
              title="Score threshold"
            />
          </div>

          {/* Dark mode + Install */}
          <button
            onClick={() => setDark(v => !v)}
            className="text-sm border dark:border-neutral-700 rounded px-2 py-1"
            title="Toggle dark mode"
          >
            {dark ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleInstall}
            disabled={!canInstall}
            className={`text-sm rounded px-2 py-1 ${canInstall ? "border dark:border-neutral-700" : "opacity-40 border"}`}
            title="Install as app"
          >
            Install
          </button>
        </div>
      </div>
    </header>
  );
}
