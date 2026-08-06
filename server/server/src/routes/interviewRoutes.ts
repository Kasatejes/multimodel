import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  startInterview,
  listInterviews,
  getInterviewById,
  generateNextQuestion,
  submitAnswer,
  completeInterview,
} from '../controllers/interviewController.js';

const router = Router();

router.post('/start', requireAuth, startInterview);
router.get('/', requireAuth, listInterviews);
router.get('/:id', requireAuth, getInterviewById);
router.post('/:id/question', requireAuth, generateNextQuestion);
router.post('/:id/answer', requireAuth, submitAnswer);
router.post('/:id/complete', requireAuth, completeInterview);

export default router;
