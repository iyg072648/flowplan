import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    nickname: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰(Bearer Token)이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'flowplan_jwt_secret_key_2026_secure';

  try {
    const decoded = jwt.verify(token, secret) as { id: string; nickname: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
  }
};
