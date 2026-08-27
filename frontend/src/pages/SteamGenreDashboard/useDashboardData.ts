import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { HUES, MONTHS } from "../../components/dashboard/theme";
import { toDashboardGenre, type DashboardGenre } from "../../components/dashboard/types";
import { useSteamSync } from "./useSteamSync";

export function useDashboardData() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(2);

  const [genres, setGenres] = useState<DashboardGenre[]>([]);
  const [years, setYears] = useState<number[]>([2023, 2024, 2025]);
  const [totalGames, setTotalGames] = useState(0);
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
  const monthLabel = month === -1 ? 'All months' : MONTHS[month];

  return {
    year, setYear,
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
