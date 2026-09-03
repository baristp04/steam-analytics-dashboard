import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { HUES, MONTHS } from "../../components/dashboard/theme";
import { toDashboardGenre, type DashboardGenre } from "../../components/dashboard/types";
import { useSteamSync } from "./useSteamSync";

export function useDashboardData() {

  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState(-1);

  const [genres, setGenres] = useState<DashboardGenre[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadYears = useCallback(async () => {
    try {
      const data = await api.getYears();
      setYears(data);
      // Mevcut seçili yıl listede varsa koru, yoksa (veya henüz seçilmediyse) ilk yıla geç.
      setYear(prev => (prev !== null && data.includes(prev) ? prev : data[0] ?? null));
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
    // Yıl listesi henüz yüklenmemişse bekle.
    if (year === null) return;

    setLoading(true);
    setError(null);
    try {
      const analyticsData = await api.getReleasesByGenre(year, month === -1 ? undefined : month + 1);

      const genreCounts = new Map(analyticsData.genres.map(g => [g.genre_id, g.game_count]));

      setGenres(prev => prev.map(g => ({
        ...g,
        count: genreCounts.get(g.id) ?? 0,
      })));
      setTotalGames(analyticsData.total_games);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadYears();
    loadGenres();
  }, [loadYears, loadGenres]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refreshAfterSync = useCallback(() => {
    loadYears();
    loadGenres();
    loadAnalytics();
  }, [loadYears, loadGenres, loadAnalytics]);

  const { syncing, syncBanner, triggerSync } = useSteamSync(refreshAfterSync);

  const sortedGenres = useMemo(
    () => [...genres].sort((a, b) => b.count - a.count),
    [genres],
  );

  const maxCount = sortedGenres.length > 0 ? Math.max(...sortedGenres.map(g => g.count), 1) : 1;
  const topGenres = sortedGenres.filter(g => g.count > 0).slice(0, 5);
  const topGenre = topGenres[0];
  const monthLabel = month === -1 ? 'All months' : MONTHS[month] ?? '';

  return {
    year: year ?? years[0] ?? 0, setYear: setYear as (y: number) => void,
    month, setMonth,
    genres: sortedGenres,
    years,
    loading,
    error,
    loadAnalytics,
    maxCount,
    totalGames,
    topGenre,
    topGenres,
    monthLabel,
    syncing,
    syncBanner,
    triggerSync,
  };
}
