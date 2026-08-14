import { Router } from 'express';

import yearsRouter from './years';
import monthsRouter from './months';
import genresRouter from './genres';
import gamesRouter from './games';
import analyticsRouter from './analytics';
import adminRouter from './admin';

const router = Router();

router.use('/years', yearsRouter);
router.use('/months', monthsRouter);
router.use('/genres', genresRouter);
router.use('/games', gamesRouter);
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);

export default router;