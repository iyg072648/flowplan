import { Router } from 'express';
import { handleSplitTasks } from '../controllers/aiController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// AI 목표 분할 엔드포인트 (POST /api/ai/split-tasks)
router.post('/split-tasks', authenticateJWT, handleSplitTasks);

export default router;
