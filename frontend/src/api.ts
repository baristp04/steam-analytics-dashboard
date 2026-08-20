const API_BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface Genre {
  id: string;
  name: string;
}

export interface Game {
  appid: number;
  name: string;
  release_date: string;
  release_year: number | null;
  release_month: number | null;
  genres: { id: string; name: string }[];
  last_modified: number | null;
  grid_image?: string | null; 
}

export interface GamesResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  games: Game[];
}

export interface YearsResponse {
  years: number[];
}

export interface MonthsResponse {
  year: number;
  months: number[];
}

export const api = {
  getGenres: () => fetchJson<{ genres: Genre[] }>('/genres').then(r => r.genres),

  getYears: () => fetchJson<YearsResponse>('/years').then(r => r.years),

  getMonths: (year: number) => fetchJson<MonthsResponse>(`/months?year=${year}`).then(r => r.months),

  getReleasesByGenre: (year: number, month?: number) => {
    const params = new URLSearchParams({ year: String(year) });
    if (month !== undefined) params.set('month', String(month));
    return fetchJson<{
      year: number;
      month: number | null;
      total_games: number;
      genres: { genre_id: string; genre_name: string; game_count: number }[];
    }>(`/analytics/releases-by-genre?${params.toString()}`);
  },

  getGames: (params: {
    year?: number;
    month?: number;
    genre?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.year !== undefined) searchParams.set('year', String(params.year));
    if (params.month !== undefined) searchParams.set('month', String(params.month));
    if (params.genre) searchParams.set('genre', params.genre);
    if (params.search) searchParams.set('search', params.search);
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));
    return fetchJson<GamesResponse>(`/games?${searchParams.toString()}`);
  },
};