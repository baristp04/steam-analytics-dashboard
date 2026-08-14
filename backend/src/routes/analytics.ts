import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

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
    const gameWhere = {
      release_year: year,
      ...(month !== undefined ? { release_month: month } : {}),
    };

    // Genre başına eşleşen (game_genres satırı) sayısı
    const grouped = await prisma.gameGenre.groupBy({
      by: ['genre_id'],
      where: { game: gameWhere },
      _count: { _all: true },
    });

    const genreIds = grouped.map((g) => g.genre_id);
    const genres = await prisma.genre.findMany({ where: { id: { in: genreIds } } });
    const genreNameById = new Map(genres.map((g) => [g.id, g.name]));

    const totalGames = await prisma.game.count({ where: gameWhere });

    const byGenre = grouped
      .map((g) => ({
        genre_id: g.genre_id,
        genre_name: genreNameById.get(g.genre_id) ?? g.genre_id,
        game_count: g._count._all,
      }))
      .sort((a, b) => b.game_count - a.game_count);

    res.json({
      year,
      month: month ?? null,
      total_games: totalGames,
      genres: byGenre,
    });
  } catch (error) {
    console.error('Genre bazlı analitik veriler çekilirken hata:', error);
    res.status(500).json({ error: 'Analitik veriler alınamadı.' });
  }
});

export default router;