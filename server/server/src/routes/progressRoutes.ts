import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getProgress } from '../controllers/progressController.js';

const router = Router();

router.get('/', requireAuth, getProgress);

export default router;
