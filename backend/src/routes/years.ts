import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/years
router.get('/', async (req: Request, res: Response) => {
  try {
    const rows = await prisma.game.findMany({
      where: { release_year: { not: null } },
      distinct: ['release_year'],
      select: { release_year: true },
      orderBy: { release_year: 'desc' },
    });

    res.json({ years: rows.map((r) => r.release_year) });
  } catch (error) {
    console.error('Yıl listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Yıl listesi alınamadı.' });
  }
});

export default router;