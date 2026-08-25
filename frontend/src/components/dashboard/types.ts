import { type Genre, type Game } from "../../api";
import { HUES } from "./theme";

export type DashboardGenre = Genre & { count: number; hue: number };

export type DashboardGame = {
  appid: number;
  name: string;
  date: string;
  genres: string[];
  hue: number;
  grid_image?: string | null;
};

export function toDashboardGenre(apiGenre: Genre & { count?: number }, hue: number): DashboardGenre {
  return {
    id: apiGenre.id,
    name: apiGenre.name,
    count: apiGenre.count ?? 0,
    hue,
  };
}

export function toDashboardGame(apiGame: Game): DashboardGame {
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
