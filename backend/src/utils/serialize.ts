import type { Genre, GameGenre } from '@prisma/client';

type SerializableGame = {
  appid: bigint;
  last_modified?: bigint | null;
  genres?: (GameGenre & { genre: Genre })[];
  [key: string]: unknown;
};

export function serializeGame(game: SerializableGame) {
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