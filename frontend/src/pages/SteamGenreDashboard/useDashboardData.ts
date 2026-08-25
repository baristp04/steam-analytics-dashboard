import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { HUES, MONTHS } from "../../components/dashboard/theme";
import { toDashboardGame, toDashboardGenre, type DashboardGame, type DashboardGenre } from "../../components/dashboard/types";

export function useDashboardData() {
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

  return {
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
  };
}
