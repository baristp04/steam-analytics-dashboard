import type { Game, Genre, GameGenre } from '@prisma/client';

type GameWithGenres = Game & {
  genres?: (GameGenre & { genre: Genre })[];
};

export function serializeGame(game: GameWithGenres) {
  return {
    ...game,
    appid: Number(game.appid),
    last_modified: game.last_modified !== null && game.last_modified !== undefined
      ? Number(game.last_modified)
      : null,
    genres: game.genres
      ? game.genres.map((gg) => ({ id: gg.genre.id, name: gg.genre.name }))
      : undefined,
  };
}