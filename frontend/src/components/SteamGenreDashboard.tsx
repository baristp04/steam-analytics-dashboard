import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, ChevronRight, ExternalLink, Calendar, Layers, TrendingUp, X, Loader2, AlertCircle } from "lucide-react";
import { api, type Genre, type Game } from "../api";

// ---- Steam-ish design tokens ----
const C = {
  bgDarkest: "#131f2c",
  bg: "#1e3044",
  bgPanel: "#1d2e40",
  bgCard: "#263a4f",
  bgCardHover: "#304862",
  border: "#3a5674",
  blue: "#66c0f4",
  blueDim: "#82abc4",
  green: "#a4d007",
  text: "#d3e1ec",
  textDim: "#9db0c0",
  white: "#f1f5f9",
  red: "#e74c3c",
};

const FONT = "'Segoe UI', 'Motiva Sans', Arial, sans-serif";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HUES: Record<string, number> = {
  action: 200,
  indie: 260,
  adventure: 30,
  rpg: 340,
  casual: 100,
  strategy: 15,
  simulation: 170,
  puzzle: 55,
};

const steamUrl = (appid: number) => `https://store.steampowered.com/app/${appid}`;

function toDashboardGenre(apiGenre: Genre & { count?: number }, hue: number): Genre & { count: number; hue: number } {
  return {
    id: apiGenre.id,
    name: apiGenre.name,
    count: apiGenre.count ?? 0,
    hue,
  };
}

function toDashboardGame(apiGame: Game): DashboardGame { 
  const genreIds = apiGame.genres.map(g => g.id);
  const firstGenreId = genreIds[0] ?? "action";
  return {
    appid: apiGame.appid,
    name: apiGame.name,
    date: apiGame.release_date?.split('T')[0] ?? '',
    genres: genreIds,
    hue: HUES[firstGenreId] ?? 200,
    grid_image: apiGame.grid_image, 
  };
}

const selectStyle: React.CSSProperties = {
  background: C.bgPanel,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  padding: "6px 10px",
  color: C.text,
  fontSize: 13,
  outline: "none",
};

function GameTile({ g, allGenres }: { g: ReturnType<typeof toDashboardGame>; allGenres: DashboardGenre[] }) {
  const genreNames = g.genres.map((gid) => allGenres.find((x) => x.id === gid)?.name).filter(Boolean);
  return (
    <a
      className="sga-tile"
      href={steamUrl(g.appid)}
      target="_blank"
      rel="noreferrer"
      style={{
        background: `linear-gradient(150deg, hsl(${g.hue},42%,24%) 0%, hsl(${g.hue},55%,10%) 100%)`,
      }}
    >
      {/* EĞER RESİM VARSA GÖSTER, YOKSA ESKİ İKONU GÖSTER */}
      {g.grid_image ? (
        <img 
          src={g.grid_image} 
          alt={g.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      ) : (
        <div className="sga-icon">
          <Layers size={34} color={`hsl(${g.hue},55%,70%)`} strokeWidth={1.3} />
        </div>
      )}

      <div className="sga-title-strip">
        <span>{g.name}</span>
      </div>

      <div className="sga-hover-panel">
        <div className="sga-hover-name">{g.name}</div>
        <div className="sga-hover-meta">{g.date} · #{g.appid}</div>
        <div className="sga-hover-tags">
          {genreNames.map((n) => (
            <span key={n} className="sga-hover-tag">{n}</span>
          ))}
        </div>
        <div className="sga-hover-link">
          View on Steam <ExternalLink size={11} />
        </div>
      </div>
    </a>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: C.bgPanel,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: "16px 18px",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={15} color={accent} />
        <span style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: C.textDim }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: C.white }}>{value}</div>
    </div>
  );
}

type DashboardGenre = Genre & { count: number; hue: number };
type DashboardGame = { 
  appid: number; 
  name: string; 
  date: string; 
  genres: string[]; 
  hue: number; 
  grid_image?: string | null; 
};

export default function SteamGenreDashboard() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(2);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [genres, setGenres] = useState<DashboardGenre[]>([]);
  const [years, setYears] = useState<number[]>([2023, 2024, 2025]);
  const [games, setGames] = useState<DashboardGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadYears = useCallback(async () => {
    try {
      const data = await api.getYears();
      setYears(data);
    } catch (e) {
      console.error('Failed to load years:', e);
    }
  }, []);

  const loadGenres = useCallback(async () => {
    try {
      const data = await api.getGenres();
      const withCounts = data.map(g => toDashboardGenre(g, HUES[g.id] ?? 200));
      setGenres(withCounts);
    } catch (e) {
      console.error('Failed to load genres:', e);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sadece analitik verisini çekiyoruz, oyunları loadGames zaten çekiyor
      const analyticsData = await api.getReleasesByGenre(year, month === -1 ? undefined : month + 1);

      const genreCounts = new Map(analyticsData.genres.map(g => [g.genre_id, g.game_count]));
      
      setGenres(prev => prev.map(g => ({
        ...g,
        count: genreCounts.get(g.id) ?? 0,
      })));

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [year, month]); // <-- genres buradan kaldırıldı!

  const loadGames = useCallback(async () => {
    try {
      const data = await api.getGames({
        year,
        month: month === -1 ? undefined : month + 1,
        genre: activeGenre ?? undefined,
        search: query,
        pageSize: 50,
      });
      setGames(data.games.map(toDashboardGame));
    } catch (e) {
      console.error('Failed to load games:', e);
    }
  }, [year, month, activeGenre, query]);

  useEffect(() => {
    loadYears();
    loadGenres();
  }, [loadYears, loadGenres]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const maxCount = genres.length > 0 ? Math.max(...genres.map(g => g.count)) : 1;
  const totalGames = genres.reduce((s, g) => s + g.count, 0);
  const topGenre = genres.reduce((a, b) => (b.count > a.count ? b : a), genres[0]);
  const monthLabel = month === -1 ? 'All months' : MONTHS[month];

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesGenre = !activeGenre || g.genres.includes(activeGenre);
      const matchesQuery = g.name.toLowerCase().includes(query.toLowerCase());
      return matchesGenre && matchesQuery;
    });
  }, [activeGenre, query, games]);

  const genreObj = genres.find((g) => g.id === activeGenre);

  if (loading) {
    return (
      <div
        style={{
          fontFamily: FONT,
          background: `radial-gradient(circle at 50% 40%, #274b68 0%, #1d3650 35%, ${C.bgDarkest} 75%, #0e1a28 100%)`,
          color: C.text,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} color={C.blue} />
        <span style={{ color: C.textDim }}>Loading analytics...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          fontFamily: FONT,
          background: `radial-gradient(circle at 50% 40%, #274b68 0%, #1d3650 35%, ${C.bgDarkest} 75%, #0e1a28 100%)`,
          color: C.text,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          padding: 20,
        }}
      >
        <AlertCircle size={32} color={C.red} />
        <span style={{ color: C.red }}>{error}</span>
        <button
          onClick={loadAnalytics}
          style={{
            background: C.blue,
            color: C.bgDarkest,
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: FONT,
        background: `radial-gradient(circle at 50% 40%, #274b68 0%, #1d3650 35%, ${C.bgDarkest} 75%, #0e1a28 100%)`,
        color: C.text,
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
    <div style={{ background: C.bgDarkest, borderBottom: `1px solid ${C.border}`, padding: "12px 32px", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1500 }}>
          <div style={{ width: 26, height: 26, borderRadius: 4, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: C.bgDarkest }}>
            S
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.white, letterSpacing: 0.3 }}>
            GENRE RELEASE ANALYTICS
          </span>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: C.textDim }}>
          <span style={{ color: C.blue, cursor: "pointer" }}>Dashboard</span>
          <span style={{ cursor: "pointer" }}>Games</span>
          <span style={{ cursor: "pointer" }}>Genres</span>
          <span style={{ cursor: "pointer" }}>Sync</span>
        </div>
      </div>

      <div style={{ padding: "24px 32px", width: "100%", maxWidth: 1500, margin: "0 auto" }}>
        {/* Filter row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim, fontSize: 12 }}>
            <Calendar size={14} />
            <span>Period</span>
          </div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
            <option value={-1}>All months</option>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
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
                width: 200,
              }}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatCard label={`${monthLabel} ${year} total`} value={totalGames} icon={Layers} accent={C.blue} />
          <StatCard label="Top genre this month" value={topGenre?.name ?? '—'} icon={TrendingUp} accent={C.green} />
          <StatCard label="Active genres" value={genres.length} icon={Layers} accent={C.blue} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18 }}>
          {/* Genre breakdown */}
          <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, marginBottom: 12 }}>
              Breakdown by genre
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {genres.map((g) => {
                const isActive = activeGenre === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setActiveGenre(isActive ? null : g.id)}
                    style={{
                      cursor: "pointer",
                      padding: "6px 8px",
                      borderRadius: 3,
                      background: isActive ? C.bgCardHover : "transparent",
                      border: `1px solid ${isActive ? C.blueDim : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: isActive ? C.blue : C.text }}>{g.name}</span>
                      <span style={{ color: C.textDim }}>{g.count}</span>
                    </div>
                    <div style={{ height: 5, background: C.bgDarkest, borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(g.count / maxCount) * 100}%`,
                          height: "100%",
                          background: isActive ? C.blue : `hsl(${g.hue},50%,58%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game list / genre detail */}
          <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
                {genreObj ? (
                  <>
                    <span>{genreObj.name}</span>
                    <ChevronRight size={12} />
                    <span style={{ color: C.text, textTransform: "none", letterSpacing: 0 }}>{filteredGames.length} games</span>
                  </>
                ) : (
                  <span>{monthLabel} {year} — all games ({filteredGames.length})</span>
                )}
              </div>
              {genreObj && (
                <button
                  onClick={() => setActiveGenre(null)}
                  style={{ background: "none", border: "none", color: C.textDim, display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}
                >
                  <X size={13} /> Clear filter
                </button>
              )}
            </div>

            <div className="sga-grid">
              {filteredGames.map((g) => (
                <GameTile key={g.appid} g={g} allGenres={genres} />
              ))}
              {filteredGames.length === 0 && (
                <div style={{ gridColumn: "1 / -1", color: C.textDim, fontSize: 13, padding: 24, textAlign: "center" }}>
                  No games match this filter.
                </div>
              )}
            </div>

            <style>{`
              .sga-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 12px;
              }
              .sga-tile {
                position: relative;
                display: block;
                aspect-ratio: 2 / 3;
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid ${C.border};
                text-decoration: none;
                cursor: pointer;
                transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
              }
              .sga-tile:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 22px rgba(0,0,0,0.55);
                border-color: ${C.blue};
              }
              .sga-icon {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.55;
                transition: opacity .15s ease;
              }
              .sga-tile:hover .sga-icon { opacity: 0.15; }
              .sga-title-strip {
                position: absolute;
                left: 0; right: 0; bottom: 0;
                padding: 8px 8px;
                background: linear-gradient(to top, rgba(6,10,15,0.9), rgba(6,10,15,0));
                font-size: 12px;
                font-weight: 600;
                color: ${C.white};
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                opacity: 1;
                transition: opacity .15s ease;
              }
              .sga-tile:hover .sga-title-strip { opacity: 0; }
              .sga-hover-panel {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                padding: 10px;
                background: linear-gradient(to top, rgba(6,10,15,0.97) 0%, rgba(6,10,15,0.88) 55%, rgba(6,10,15,0.15) 100%);
                opacity: 0;
                transition: opacity .15s ease;
              }
              .sga-tile:hover .sga-hover-panel { opacity: 1; }
              .sga-hover-name {
                font-size: 12.5px;
                font-weight: 600;
                color: ${C.white};
                margin-bottom: 4px;
                line-height: 1.25;
              }
              .sga-hover-meta {
                font-size: 10.5px;
                color: ${C.textDim};
                margin-bottom: 6px;
              }
              .sga-hover-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-bottom: 8px;
              }
              .sga-hover-tag {
                font-size: 9.5px;
                padding: 2px 5px;
                border-radius: 2px;
                background: rgba(255,255,255,0.06);
                color: ${C.blueDim};
                border: 1px solid ${C.border};
              }
              .sga-hover-link {
                font-size: 11px;
                color: ${C.blue};
                display: flex;
                align-items: center;
                gap: 4px;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}