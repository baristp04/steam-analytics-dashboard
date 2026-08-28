import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api";
import { HUES } from "../../components/dashboard/theme";
import { toDashboardGenre, type DashboardGenre } from "../../components/dashboard/types";
import { useSteamSync } from "../SteamGenreDashboard/useSteamSync";

export interface YearCount {
  year: number;
  count: number;
}

export function useGenresData() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [genres, setGenres] = useState<DashboardGenre[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedGenre, setSelectedGenreState] = useState<string | null>(searchParams.get("genre") || null);

  const setSelectedGenre = useCallback((next: string | null) => {
    setSelectedGenreState(next);
    setSearchParams(
      (prev) => {
        if (next) prev.set("genre", next);
        else prev.delete("genre");
        return prev;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const [catalogTotal, setCatalogTotal] = useState(0);
  const [genreTotal, setGenreTotal] = useState(0);
  const [byYear, setByYear] = useState<YearCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBase = useCallback(async () => {
    try {
      const [genreData, yearData, allGames] = await Promise.all([
        api.getGenres(),
        api.getYears(),
        api.getGames({ pageSize: 1 }),
      ]);
      const mapped = genreData.map((g) => toDashboardGenre(g, HUES[g.id] ?? 200));
      setGenres(mapped);
      setYears([...yearData].sort((a, b) => a - b));
      setCatalogTotal(allGames.total);
      setSelectedGenreState((cur) => cur ?? mapped[0]?.id ?? null);
    } catch (e) {
      console.error("Failed to load base genre data:", e);
    }
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  const loadGenreStats = useCallback(async () => {
    if (!selectedGenre || years.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const [totalRes, ...yearRes] = await Promise.all([
        api.getGames({ genre: selectedGenre, pageSize: 1 }),
        ...years.map((y) => api.getGames({ genre: selectedGenre, year: y, pageSize: 1 })),
      ]);
      setGenreTotal(totalRes.total);
      setByYear(years.map((y, i) => ({ year: y, count: yearRes[i].total })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load genre stats");
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, years]);

  useEffect(() => {
    loadGenreStats();
  }, [loadGenreStats]);

  const refreshAfterSync = useCallback(() => {
    loadBase();
    loadGenreStats();
  }, [loadBase, loadGenreStats]);

  const { syncing, syncBanner, triggerSync } = useSteamSync(refreshAfterSync);

  const selectedGenreObj = genres.find((g) => g.id === selectedGenre);
  const peakYear = byYear.reduce<YearCount | null>((best, cur) => (!best || cur.count > best.count ? cur : best), null);
  const sharePct = catalogTotal > 0 ? (genreTotal / catalogTotal) * 100 : 0;

  return {
    genres,
    selectedGenre,
    setSelectedGenre,
    selectedGenreObj,
    catalogTotal,
    genreTotal,
    byYear,
    peakYear,
    sharePct,
    loading,
    error,
    reload: loadGenreStats,
    syncing,
    syncBanner,
    triggerSync,
  };
}
