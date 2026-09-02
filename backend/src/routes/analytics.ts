import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cache, CACHE_KEYS, TTL } from '../lib/cache';

const router = Router();

// GET /api/analytics/releases-by-genre?year=2025&month=3
router.get('/releases-by-genre', async (req: Request, res: Response) => {
  const year = Number(req.query.year);
  const monthRaw = req.query.month;
  const month = monthRaw !== undefined ? Number(monthRaw) : undefined;

  if (!req.query.year || Number.isNaN(year)) {
    return res.status(400).json({ error: 'Geçerli bir "year" query parametresi gerekli.' });
  }
  if (monthRaw !== undefined && (Number.isNaN(month) || month! < 1 || month! > 12)) {
    return res.status(400).json({ error: '"month" 1 ile 12 arasında bir sayı olmalı.' });
  }

  try {
    const cacheKey = CACHE_KEYS.analytics(year, month);
    const cached = cache.get<object>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const gameWhere = {
      release_year: year,
      ...(month !== undefined ? { release_month: month } : {}),
    };

    // Genre başına eşleşen (game_genres satırı) sayısı
    const [grouped, genresList, totalGames] = await Promise.all([
      prisma.gameGenre.groupBy({
        by: ['genre_id'],
        where: { game: gameWhere },
        _count: { _all: true },
      }),
      prisma.genre.findMany({
        select: { id: true, name: true },
      }),
      prisma.game.count({ where: gameWhere }),
    ]);

    const genreNameById = new Map(genresList.map((g) => [g.id, g.name]));

    const byGenre = grouped
      .map((g) => ({
        genre_id: g.genre_id,
        genre_name: genreNameById.get(g.genre_id) ?? g.genre_id,
        game_count: g._count._all,
      }))
      .sort((a, b) => b.game_count - a.game_count);

    const result = {
      year,
      month: month ?? null,
      total_games: totalGames,
      genres: byGenre,
    };

    cache.set(cacheKey, result, TTL.MEDIUM);
    res.json(result);
  } catch (error) {
    console.error('Genre bazlı analitik veriler çekilirken hata:', error);
    res.status(500).json({ error: 'Analitik veriler alınamadı.' });
  }
});

export default router;