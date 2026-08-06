import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createStudyPlan, listStudyPlans, getStudyPlanById } from '../controllers/studyPlanController.js';

const router = Router();

router.post('/', requireAuth, createStudyPlan);
router.get('/', requireAuth, listStudyPlans);
router.get('/:id', requireAuth, getStudyPlanById);

export default router;
