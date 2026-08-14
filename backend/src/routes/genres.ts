import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/genres
router.get('/', async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ genres });
  } catch (error) {
    console.error('Genre listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Genre listesi alınamadı.' });
  }
});

export default router;