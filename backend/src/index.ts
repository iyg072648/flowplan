import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { initDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 헬스체크 및 핑 테스트 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// DB 초기화 및 서버 기동
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FlowPlan Backend Server is running on http://localhost:${PORT}`);
  });
});

export default app;
