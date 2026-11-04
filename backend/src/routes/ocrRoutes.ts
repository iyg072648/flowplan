import { Router } from 'express';
import multer from 'multer';
import { extractTextFromImage } from '../controllers/ocrController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// 메모리 스토리지 설정 (최대 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// 이미지 OCR 추출 엔드포인트
router.post('/extract', authenticateJWT, upload.single('image'), extractTextFromImage);

export default router;
