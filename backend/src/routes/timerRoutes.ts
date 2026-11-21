import { Router } from 'express';
import {
  saveTimerSession,
  getTodayStudySummary,
} from '../controllers/timerController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// 타이머 API는 인증된 사용자만 접근 가능
router.use(authenticateJWT);

router.post('/session', saveTimerSession);
router.get('/today', getTodayStudySummary);

export default router;
