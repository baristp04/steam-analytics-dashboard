import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Layers, Loader2, PieChart } from "lucide-react";
import { C, FONT } from "../../components/dashboard/theme";
import { StatCard } from "../../components/dashboard/StatCard";
import "../../components/dashboard/dashboard.css";
import { TopBar } from "../SteamGenreDashboard/TopBar";
import { SyncBanner } from "../SteamGenreDashboard/SyncBanner";
import { useGenresData } from "./useGenresData";
import { YearTrend } from "./YearTrend";

export default function GenresPage() {
  const {
    genres,
    selectedGenre,
    setSelectedGenre,
    selectedGenreObj,
    genreTotal,
    byYear,
    peakYear,
    sharePct,
    loading,
    error,
    reload,
    syncing,
    syncBanner,
    triggerSync,
  } = useGenresData();

  const hue = selectedGenreObj?.hue ?? 200;

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

        <h1 style={{ fontSize: 20, fontWeight: 600, color: C.white, margin: "0 0 18px" }}>Genre analytics</h1>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18, alignItems: "start" }}>
          {/* Genre seçimi */}
          <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, margin: "4px 6px 10px" }}>
              Select a genre
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {genres.map((g) => {
                const active = g.id === selectedGenre;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 3,
                      border: `1px solid ${active ? C.blueDim : "transparent"}`,
                      background: active ? C.bgCardHover : "transparent",
                      color: active ? C.blue : C.text,
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: `hsl(${g.hue},55%,58%)`, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{g.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seçilen genre analitiği */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error ? (
              <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, textAlign: "center", color: C.red, fontSize: 13 }}>
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
              <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: C.textDim }}>
                <Loader2 size={22} style={{ animation: "sga-spin 1s linear infinite" }} color={C.blue} />
                Loading genre stats...
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: C.white }}>{selectedGenreObj?.name ?? "—"}</span>
                  <Link
                    to={`/games?genre=${selectedGenre ?? ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: C.bgDarkest,
                      background: C.blue,
                      borderRadius: 4,
                      padding: "7px 12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View {genreTotal.toLocaleString()} games <ArrowRight size={14} />
                  </Link>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <StatCard label="Games in genre" value={genreTotal} icon={Layers} accent={C.blue} />
                  <StatCard label="Share of catalog" value={`${sharePct.toFixed(1)}%`} icon={PieChart} accent={C.green} />
                  <StatCard label="Peak year" value={peakYear && peakYear.count > 0 ? `${peakYear.year} (${peakYear.count})` : "—"} icon={CalendarDays} accent={C.blue} />
                </div>

                <YearTrend byYear={byYear} hue={hue} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
