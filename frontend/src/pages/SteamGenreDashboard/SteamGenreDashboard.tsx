import { Layers, TrendingUp } from "lucide-react";
import { C, FONT } from "../../components/dashboard/theme";
import { StatCard } from "../../components/dashboard/StatCard";
import "../../components/dashboard/dashboard.css";
import { useDashboardData } from "./useDashboardData";
import { LoadingView } from "./LoadingView";
import { ErrorView } from "./ErrorView";
import { TopBar } from "./TopBar";
import { FilterBar } from "./FilterBar";
import { GenreBreakdown } from "./GenreBreakdown";
import { GameGridPanel } from "./GameGridPanel";
import { SyncBanner } from "./SyncBanner";

export default function SteamGenreDashboard() {
  const {
    year, setYear,
    month, setMonth,
    activeGenre, setActiveGenre,
    query, setQuery,
    genres,
    years,
    loading,
    error,
    loadAnalytics,
    maxCount,
    totalGames,
    topGenre,
    monthLabel,
    filteredGames,
    genreObj,
    syncing,
    syncBanner,
    triggerSync,
  } = useDashboardData();

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadAnalytics} />;
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
      <TopBar syncing={syncing} onSync={triggerSync} />

      <div style={{ padding: "24px 32px", width: "100%", maxWidth: 1500, margin: "0 auto" }}>
        {syncBanner && <SyncBanner status={syncBanner.status} message={syncBanner.message} />}

        <FilterBar
          year={year}
          onYearChange={setYear}
          years={years}
          month={month}
          onMonthChange={setMonth}
          query={query}
          onQueryChange={setQuery}
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatCard label={`${monthLabel} ${year} total`} value={totalGames} icon={Layers} accent={C.blue} />
          <StatCard label="Top genre this month" value={topGenre?.name ?? '—'} icon={TrendingUp} accent={C.green} />
          <StatCard label="Active genres" value={genres.length} icon={Layers} accent={C.blue} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18 }}>
          <GenreBreakdown
            genres={genres}
            activeGenre={activeGenre}
            maxCount={maxCount}
            onSelectGenre={setActiveGenre}
          />

          <GameGridPanel
            genreObj={genreObj}
            monthLabel={monthLabel}
            year={year}
            filteredGames={filteredGames}
            allGenres={genres}
            onClearFilter={() => setActiveGenre(null)}
          />
        </div>
      </div>
    </div>
  );
}
