import { Router } from 'express';
import { getStatsSummary } from '../controllers/statsController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// 통계 API는 인증된 사용자 접근 허용 (토큰 부재 시 미들웨어 또는 컨트롤러에서 안전하게 처리)
router.use(authenticateJWT);

// GET /api/stats/summary?period=WEEKLY|MONTHLY
router.get('/summary', getStatsSummary);

export default router;
