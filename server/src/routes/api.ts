import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { aiSecurityGuard } from '../middleware/securityMiddleware.js';

import * as authController from '../controllers/authController.js';
import * as workspaceController from '../controllers/workspaceController.js';
import * as fileController from '../controllers/fileController.js';
import * as aiController from '../controllers/aiController.js';
import * as chatController from '../controllers/chatController.js';
import * as studyController from '../controllers/studyController.js';
import * as analyticsController from '../controllers/analyticsController.js';
import * as documentController from '../controllers/documentController.js';
import * as imageController from '../controllers/imageController.js';
import * as transcriptController from '../controllers/transcriptController.js';

const router = Router();

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/password-reset-request', authController.requestPasswordReset);
router.post('/auth/password-reset-confirm', authController.confirmPasswordReset);
router.post('/auth/oauth', authController.oauthLogin);
router.get('/auth/google', authController.initiateGoogleOAuth);
router.get('/auth/google/callback', authController.initiateGoogleOAuth);
router.get('/auth/github', authController.initiateGithubOAuth);
router.get('/auth/github/callback', authController.initiateGithubOAuth);
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

// Multimodal AI Feature Routes, Security & Streaming
router.post('/ai/chat', authenticateToken, aiSecurityGuard, aiController.chatMultimodal);
router.get('/ai/stream', authenticateToken, aiSecurityGuard, aiController.streamChat);
router.post('/ai/summarize', authenticateToken, aiController.summarizeFile);
router.post('/ai/notes', authenticateToken, aiController.generateNotes);
router.post('/ai/flashcards', authenticateToken, aiController.generateFlashcards);
router.post('/ai/quiz', authenticateToken, aiController.generateQuiz);
router.post('/ai/interview', authenticateToken, aiController.generateInterview);
router.post('/ai/timeline', authenticateToken, aiController.extractTimeline);

// AI Image Generation & Image Library Routes
router.post('/ai/generate-image', authenticateToken, aiSecurityGuard, imageController.generateAndStoreImage);
router.get('/images', authenticateToken, imageController.getImageLibrary);
router.patch('/images/:id/favorite', authenticateToken, imageController.toggleFavoriteImage);
router.delete('/images/:id', authenticateToken, imageController.deleteImage);

// Audio Dictation, Whisper & Transcript Library Routes
router.post('/ai/transcribe', authenticateToken, transcriptController.transcribeAudio);
router.get('/transcripts', authenticateToken, transcriptController.getTranscriptLibrary);
router.delete('/transcripts/:id', authenticateToken, transcriptController.deleteTranscript);

// Permanent Text Document Vault & Audit Logs Routes
router.post('/documents', authenticateToken, documentController.createProcessedDocument);
router.get('/documents', authenticateToken, documentController.getProcessedDocuments);
router.put('/documents/:id', authenticateToken, documentController.updateProcessedDocument);
router.patch('/documents/:id/soft-delete', authenticateToken, documentController.softDeleteDocument);
router.patch('/documents/:id/recover', authenticateToken, documentController.recoverDocument);
router.delete('/documents/:id', authenticateToken, documentController.hardDeleteDocument);
router.get('/documents/:id/versions', authenticateToken, documentController.getDocumentVersions);
router.get('/audit-logs', authenticateToken, documentController.getAuditLogs);

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

// Analytics & Global Workspace Search Routes
router.get('/analytics', authenticateToken, analyticsController.getAnalytics);
router.get('/search', authenticateToken, analyticsController.globalSearch);

export default router;
