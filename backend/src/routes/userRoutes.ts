import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// 내 프로필 조회 및 설정
router.get('/me', authenticateJWT, getMyProfile);
router.put('/me', authenticateJWT, updateMyProfile);

export default router;
