import { Router, Request, Response } from 'express';
import { runSteamSync } from '../services/steam_service';
import prisma from '../lib/prisma';
import { cache } from '../lib/cache';

const router = Router();

// POST /api/admin/sync-steam
router.post('/sync-steam', (req: Request, res: Response) => {
  runSteamSync();

  res.json({ message: 'Steam senkronizasyon işlemi (sync job) arka planda başlatıldı.' });
});

// GET /api/admin/sync-status
router.get('/sync-status', async (req: Request, res: Response) => {
  try {
    const lastRun = await prisma.syncRun.findFirst({
      orderBy: { started_at: 'desc' },
    });

    if (!lastRun) {
      return res.json({ message: 'Henüz hiç sync çalıştırılmamış.' });
    }

    res.json({
      ...lastRun,
      id: Number(lastRun.id),
    });
  } catch (error) {
    console.error('Sync durumu çekilirken hata:', error);
    res.status(500).json({ error: 'Sync durumu alınamadı.' });
  }
});

// POST /api/admin/clear-cache
// Cache manuel olarak temizlemek için (örn. veri manuel değiştirildikten sonra)
router.post('/clear-cache', (req: Request, res: Response) => {
  const before = cache.size();
  cache.clear();
  res.json({ message: `Cache temizlendi. ${before} kayıt silindi.` });
});

export default router;