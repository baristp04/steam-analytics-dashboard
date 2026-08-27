import type React from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { C, FONT, MONTHS, selectStyle } from "../../components/dashboard/theme";
import { GameTile } from "../../components/dashboard/GameTile";
import "../../components/dashboard/dashboard.css";
import { TopBar } from "../SteamGenreDashboard/TopBar";
import { SyncBanner } from "../SteamGenreDashboard/SyncBanner";
import { useGamesData } from "./useGamesData";

export default function GamesPage() {
  const {
    year, setYear,
    month, setMonth,
    genre, setGenre,
    query, setQuery,
    page, setPage,
    totalPages,
    total,
    genres,
    years,
    games,
    loading,
    error,
    reload,
    syncing,
    syncBanner,
    triggerSync,
  } = useGamesData();

  return (
    <div
      style={{
        fontFamily: FONT,
        background: `radial-gradient(circle at 50% 40%, #274b68 0%, #1d3650 35%, ${C.bgDarkest} 75%, #0e1a28 100%)`,
        color: C.text,
        minHeight: "100vh",
      }}
    >
      <TopBar syncing={syncing} onSync={triggerSync} />

      <div style={{ padding: "24px 32px", width: "100%", maxWidth: 1500, margin: "0 auto" }}>
        {syncBanner && <SyncBanner status={syncBanner.status} message={syncBanner.message} />}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: C.white, margin: 0 }}>All Games</h1>
          <span style={{ fontSize: 13, color: C.textDim }}>{total.toLocaleString()} games</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
            <option value={-1}>All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
            <option value={-1}>All months</option>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={genre ?? ""} onChange={(e) => setGenre(e.target.value || null)} style={selectStyle}>
            <option value="">All genres</option>
            {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <div style={{ marginLeft: "auto", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: C.textDim }} />
            <input
              placeholder="Search games..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                background: C.bgPanel,
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                padding: "7px 10px 7px 30px",
                color: C.text,
                fontSize: 13,
                outline: "none",
                width: 220,
              }}
            />
          </div>
        </div>

        <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16, minHeight: 200 }}>
          {error ? (
            <div style={{ color: C.red, fontSize: 13, padding: 24, textAlign: "center" }}>
              {error}
              <div>
                <button
                  onClick={reload}
                  style={{ marginTop: 12, background: C.blue, color: C.bgDarkest, border: "none", borderRadius: 4, padding: "6px 14px", fontWeight: 600, cursor: "pointer" }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 40, color: C.textDim }}>
              <Loader2 size={22} style={{ animation: "sga-spin 1s linear infinite" }} color={C.blue} />
              Loading games...
            </div>
          ) : (
            <div className="sga-grid">
              {games.map((g) => (
                <GameTile key={g.appid} g={g} allGenres={genres} />
              ))}
              {games.length === 0 && (
                <div style={{ gridColumn: "1 / -1", color: C.textDim, fontSize: 13, padding: 24, textAlign: "center" }}>
                  No games match these filters.
                </div>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18 }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              style={pagerBtn(page <= 1)}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 13, color: C.textDim }}>
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              style={pagerBtn(page >= totalPages)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function pagerBtn(disabled: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: "6px 12px",
    color: disabled ? C.textDim : C.text,
    fontSize: 13,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
