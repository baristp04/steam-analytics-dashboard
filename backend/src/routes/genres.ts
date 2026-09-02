import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cache, CACHE_KEYS, TTL } from '../lib/cache';

const router = Router();

// GET /api/genres
router.get('/', async (req: Request, res: Response) => {
  try {
    const cached = cache.get<{ id: string; name: string }[]>(CACHE_KEYS.GENRES);
    if (cached) {
      return res.json({ genres: cached });
    }

    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });

    cache.set(CACHE_KEYS.GENRES, genres, TTL.XLONG);
    res.json({ genres });
  } catch (error) {
    console.error('Genre listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Genre listesi alınamadı.' });
  }
});

export default router;