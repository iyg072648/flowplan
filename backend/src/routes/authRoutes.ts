import { Router } from 'express';
import { kakaoLogin } from '../controllers/authController';

const router = Router();

// 카카오 소셜 로그인
router.post('/login', kakaoLogin);
router.post('/kakao', kakaoLogin);

export default router;
