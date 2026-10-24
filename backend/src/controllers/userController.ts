import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  nickname: string;
  target_exam: string;
}

// 내 프로필 조회 (GET /api/users/me)
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, email, nickname, target_exam FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error: any) {
    return res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.', details: error.message });
  }
};

// 프로필 설정/수정 (PUT /api/users/me)
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { nickname, target_exam } = req.body;

  if (!nickname || !target_exam) {
    return res.status(400).json({ error: 'nickname과 target_exam은 필수 입력 항목입니다.' });
  }

  try {
    await pool.query(
      'UPDATE users SET nickname = ?, target_exam = ? WHERE id = ?',
      [nickname, target_exam, userId]
    );

    return res.status(200).json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      profile: {
        id: userId,
        nickname,
        target_exam,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: '프로필 저장 중 오류가 발생했습니다.', details: error.message });
  }
};
