import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cache, CACHE_KEYS, TTL } from '../lib/cache';

const router = Router();

// GET /api/years
router.get('/', async (req: Request, res: Response) => {
  try {
    const cached = cache.get<number[]>(CACHE_KEYS.YEARS);
    if (cached) {
      return res.json({ years: cached });
    }

    // findMany+distinct yerine groupBy: GROUP BY SQL üretir, daha verimli
    const rows = await prisma.game.groupBy({
      by: ['release_year'],
      where: { release_year: { not: null } },
      orderBy: { release_year: 'desc' },
    });

    const years = rows.map((r) => r.release_year as number);
    cache.set(CACHE_KEYS.YEARS, years, TTL.XLONG);

    res.json({ years });
  } catch (error) {
    console.error('Yıl listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Yıl listesi alınamadı.' });
  }
});

export default router;