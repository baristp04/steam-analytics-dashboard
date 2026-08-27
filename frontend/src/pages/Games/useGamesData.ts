import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";
import { HUES } from "../../components/dashboard/theme";
import { toDashboardGame, toDashboardGenre, type DashboardGame, type DashboardGenre } from "../../components/dashboard/types";
import { useSteamSync } from "../SteamGenreDashboard/useSteamSync";

const PAGE_SIZE = 40;

export function useGamesData() {
  const [year, setYear] = useState<number | -1>(-1);
  const [month, setMonth] = useState(-1);
  const [genre, setGenre] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [genres, setGenres] = useState<DashboardGenre[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [games, setGames] = useState<DashboardGame[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [year, month, genre, query]);

  const loadGenres = useCallback(async () => {
    try {
      const data = await api.getGenres();
      setGenres(data.map((g) => toDashboardGenre(g, HUES[g.id] ?? 200)));
    } catch (e) {
      console.error("Failed to load genres:", e);
    }
  }, []);

  const loadYears = useCallback(async () => {
    try {
      setYears(await api.getYears());
    } catch (e) {
      console.error("Failed to load years:", e);
    }
  }, []);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGames({
        year: year === -1 ? undefined : year,
        month: month === -1 ? undefined : month + 1,
        genre: genre ?? undefined,
        search: query || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setGames(data.games.map(toDashboardGame));
      setTotal(data.total);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load games");
    } finally {
      setLoading(false);
    }
  }, [year, month, genre, query, page]);

  useEffect(() => {
    loadGenres();
    loadYears();
  }, [loadGenres, loadYears]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const refreshAfterSync = useCallback(() => {
    loadGenres();
    loadYears();
    loadGames();
  }, [loadGenres, loadYears, loadGames]);

  const { syncing, syncBanner, triggerSync } = useSteamSync(refreshAfterSync);

  return {
    syncing,
    syncBanner,
    triggerSync,
    year, setYear,
    month, setMonth,
    genre, setGenre,
    query, setQuery,
    page, setPage,
    totalPages,
    total,
    pageSize: PAGE_SIZE,
    genres,
    years,
    games,
    loading,
    error,
    reload: loadGames,
  };
}
