import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/months?year=2025
router.get('/', async (req: Request, res: Response) => {
  const year = Number(req.query.year);

  if (!req.query.year || Number.isNaN(year)) {
    return res.status(400).json({ error: 'Geçerli bir "year" query parametresi gerekli, örn: /api/months?year=2025' });
  }

  try {
    const rows = await prisma.game.findMany({
      where: { release_year: year, release_month: { not: null } },
      distinct: ['release_month'],
      select: { release_month: true },
      orderBy: { release_month: 'asc' },
    });

    res.json({ year, months: rows.map((r) => r.release_month) });
  } catch (error) {
    console.error('Ay listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Ay listesi alınamadı.' });
  }
});

export default router;