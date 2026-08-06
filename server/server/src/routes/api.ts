import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

import * as authController from '../controllers/authController.js';
import * as workspaceController from '../controllers/workspaceController.js';
import * as fileController from '../controllers/fileController.js';
import * as aiController from '../controllers/aiController.js';
import * as chatController from '../controllers/chatController.js';
import * as studyController from '../controllers/studyController.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// Workspace Routes
router.get('/workspaces', authenticateToken, workspaceController.getWorkspaces);
router.post('/workspaces', authenticateToken, workspaceController.createWorkspace);
router.put('/workspaces/:id', authenticateToken, workspaceController.updateWorkspace);
router.delete('/workspaces/:id', authenticateToken, workspaceController.deleteWorkspace);

// File Routes
router.post('/files/upload', authenticateToken, upload.array('files', 10), fileController.uploadFiles);
router.get('/files', authenticateToken, fileController.getFiles);
router.get('/files/:id', authenticateToken, fileController.getFileById);
router.delete('/files/:id', authenticateToken, fileController.deleteFile);
router.patch('/files/:id/favorite', authenticateToken, fileController.toggleFavoriteFile);

// Multimodal AI Feature Routes
router.post('/ai/chat', authenticateToken, aiController.chatMultimodal);
router.post('/ai/summarize', authenticateToken, aiController.summarizeFile);
router.post('/ai/notes', authenticateToken, aiController.generateNotes);
router.post('/ai/flashcards', authenticateToken, aiController.generateFlashcards);
router.post('/ai/quiz', authenticateToken, aiController.generateQuiz);
router.post('/ai/interview', authenticateToken, aiController.generateInterview);
router.post('/ai/timeline', authenticateToken, aiController.extractTimeline);

// Chat Session Routes
router.get('/chats', authenticateToken, chatController.getChats);
router.post('/chats', authenticateToken, chatController.createChat);
router.get('/chats/:id/messages', authenticateToken, chatController.getChatMessages);
router.patch('/chats/:id/pin', authenticateToken, chatController.togglePinChat);
router.delete('/chats/:id', authenticateToken, chatController.deleteChat);

// Study Hub Routes
router.get('/study/notes', authenticateToken, studyController.getNotes);
router.get('/study/flashcards', authenticateToken, studyController.getFlashcards);
router.get('/study/quizzes', authenticateToken, studyController.getQuizzes);
router.post('/study/quizzes/:id/score', authenticateToken, studyController.submitQuizScore);
router.get('/study/interviews', authenticateToken, studyController.getInterviews);
router.get('/study/timelines', authenticateToken, studyController.getTimelines);
router.get('/favorites', authenticateToken, studyController.getFavorites);

// Analytics & Global Search Routes
router.get('/analytics', authenticateToken, analyticsController.getAnalytics);
router.get('/search', authenticateToken, analyticsController.globalSearch);

export default router;
