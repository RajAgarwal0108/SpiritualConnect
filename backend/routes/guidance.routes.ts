import { Router } from 'express';
import { 
  applyForGuide, 
  getGuides, 
  getGuideById, 
  requestSession, 
  getIncomingSessions, 
  respondToSession, 
  getSessions, 
  getSessionMessages, 
  shareSessionDetails,
  updateSessionIntent,
  completeSession 
} from '../controllers/guidance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Guidance Application & Discovery API
router.post('/apply', authenticate, applyForGuide);
router.get('/guides', getGuides);
router.get('/guides/:id', getGuideById);

// Session Management API
router.post('/request', authenticate, requestSession);
router.get('/sessions', authenticate, getSessions);
router.get('/sessions/incoming', authenticate, getIncomingSessions);
router.patch('/sessions/:sessionId/respond', authenticate, respondToSession);
router.get('/sessions/:sessionId/messages', authenticate, getSessionMessages);
router.patch('/sessions/:sessionId/share-details', authenticate, shareSessionDetails);
router.patch('/sessions/:sessionId/intent', authenticate, updateSessionIntent);
router.patch('/sessions/:sessionId/complete', authenticate, completeSession);

export default router;
