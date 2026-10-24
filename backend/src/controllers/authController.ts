import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  provider: string;
  provider_id: string;
  nickname: string;
  target_exam: string;
}

export const kakaoLogin = async (req: Request, res: Response) => {
  const { provider_token } = req.body;

  if (!provider_token) {
    return res.status(400).json({ error: 'provider_token(카카오 Access Token)이 누락되었습니다.' });
  }

  try {
    let kakaoUser: { id: string | number; email?: string; nickname?: string };

    // 테스트/Mock 토큰 지원 (개발 환경 편의성)
    if (provider_token === 'mock_kakao_token' || provider_token.startsWith('test_')) {
      kakaoUser = {
        id: 'kakao_mock_12345',
        email: 'test_user@kakao.com',
        nickname: '홍길동',
      };
    } else {
      // 실제 카카오 API 호출로 토큰 검증
      const kakaoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${provider_token}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      const { id, kakao_account } = kakaoResponse.data;
      kakaoUser = {
        id: String(id),
        email: kakao_account?.email || `${id}@kakao.user`,
        nickname: kakao_account?.profile?.nickname || '사용자',
      };
    }

    const provider = 'kakao';
    const providerId = String(kakaoUser.id);
    let userId: string;
    let isNewUser = false;

    // 1. 기존 유저 존재 여부 확인
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, nickname, target_exam FROM users WHERE provider = ? AND provider_id = ?',
      [provider, providerId]
    );

    if (rows.length > 0) {
      // 기존 유저
      userId = rows[0].id;
      isNewUser = !rows[0].target_exam || rows[0].target_exam.trim() === '';
    } else {
      // 신규 회원가입
      userId = uuidv4();
      isNewUser = true;
      const initialNickname = kakaoUser.nickname || '홍길동';

      await pool.query(
        'INSERT INTO users (id, email, provider, provider_id, nickname, target_exam) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, kakaoUser.email, provider, providerId, initialNickname, '']
      );
    }

    // 2. JWT Access Token 발급
    const secret = process.env.JWT_SECRET || 'flowplan_jwt_secret_key_2026_secure';
    const token = jwt.sign(
      { id: userId, provider },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      access_token: token,
      is_new_user: isNewUser,
    });
  } catch (error: any) {
    console.error('카카오 로그인 에러:', error.response?.data || error.message);
    return res.status(401).json({
      error: '카카오 계정 인증에 실패했습니다.',
      details: error.response?.data || error.message,
    });
  }
};
