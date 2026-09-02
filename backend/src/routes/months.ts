import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cache, CACHE_KEYS, TTL } from '../lib/cache';

const router = Router();

// GET /api/months?year=2025
router.get('/', async (req: Request, res: Response) => {
  const year = Number(req.query.year);

  if (!req.query.year || Number.isNaN(year)) {
    return res.status(400).json({ error: 'Geçerli bir "year" query parametresi gerekli, örn: /api/months?year=2025' });
  }

  try {
    const cacheKey = CACHE_KEYS.months(year);
    const cached = cache.get<number[]>(cacheKey);
    if (cached) {
      return res.json({ year, months: cached });
    }

    // findMany+distinct yerine groupBy: daha verimli SQL üretir
    const rows = await prisma.game.groupBy({
      by: ['release_month'],
      where: { release_year: year, release_month: { not: null } },
      orderBy: { release_month: 'asc' },
    });

    const months = rows.map((r) => r.release_month as number);
    cache.set(cacheKey, months, TTL.LONG);

    res.json({ year, months });
  } catch (error) {
    console.error('Ay listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Ay listesi alınamadı.' });
  }
});

export default router;