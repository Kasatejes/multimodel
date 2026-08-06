import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = Router();

router.get('/', requireAuth, getDashboardData);

export default router;
