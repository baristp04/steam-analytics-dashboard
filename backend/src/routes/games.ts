import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { serializeGame } from '../utils/serialize';

const router = Router();

// GET /api/games?year=2025&month=3&genre=Action&search=witcher&page=1&pageSize=20
router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, month, genre, search } = req.query;

    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '20'), 10) || 20));

    const where: Record<string, unknown> = {};

    if (year !== undefined) {
      const yearNum = Number(year);
      if (Number.isNaN(yearNum)) {
        return res.status(400).json({ error: '"year" sayısal bir değer olmalı.' });
      }
      where.release_year = yearNum;
    }

    if (month !== undefined) {
      const monthNum = Number(month);
      if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: '"month" 1 ile 12 arasında olmalı.' });
      }
      where.release_month = monthNum;
    }

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    if (genre) {
      where.genres = {
        some: {
          genre_id: String(genre),
        },
      };
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { release_date: 'desc' },
        select: {
          appid: true,
          name: true,
          type: true,
          release_date: true,
          release_year: true,
          release_month: true,
          coming_soon: true,
          steam_url: true,
          header_image: true,
          grid_image: true,
          last_modified: true,
          created_at: true,
          updated_at: true,
          genres: { include: { genre: true } },
        },
      }),
      prisma.game.count({ where }),
    ]);

    res.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      games: games.map(serializeGame),
    });
  } catch (error) {
    console.error('Oyun listesi çekilirken hata:', error);
    res.status(500).json({ error: 'Oyun listesi alınamadı.' });
  }
});


// GET /api/games/:appid
router.get('/:appid', async (req: Request, res: Response) => {
  let appid: bigint;
  try {
    appid = BigInt(req.params.appid as string);
  } catch {
    return res.status(400).json({ error: 'Geçersiz appid.' });
  }

  try {
    const game = await prisma.game.findUnique({
      where: { appid },
      include: { genres: { include: { genre: true } } },
    });

    if (!game) {
      return res.status(404).json({ error: 'Oyun bulunamadı.' });
    }

    res.json(serializeGame(game));
  } catch (error) {
    console.error('Oyun detayı çekilirken hata:', error);
    res.status(500).json({ error: 'Oyun detayı alınamadı.' });
  }
});

export default router;