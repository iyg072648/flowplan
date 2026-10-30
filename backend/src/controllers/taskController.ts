import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

// 1. 내 목표 목록 조회 (GET /api/goals)
export const getMyGoals = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const [goals] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return res.status(200).json(goals);
  } catch (error: any) {
    return res.status(500).json({ error: '목표 목록 조회 실패', details: error.message });
  }
};

// 2. 새 목표 및 일정 생성 (POST /api/goals)
export const createGoalWithTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, subtitle, end_date, color, tasks } = req.body;

  if (!name || !end_date) {
    return res.status(400).json({ error: '목표 이름(name)과 완료일(end_date)은 필수입니다.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const goalId = uuidv4();
    const totalTasks = Array.isArray(tasks) ? tasks.length : 0;

    // 목표 등록
    await connection.query(
      'INSERT INTO goals (id, user_id, name, subtitle, end_date, color, total_tasks) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [goalId, userId, name, subtitle || '', end_date, color || '#4F46E5', totalTasks]
    );

    // 일정(Tasks) 일괄 등록
    if (totalTasks > 0) {
      for (const t of tasks) {
        const taskId = uuidv4();
        await connection.query(
          'INSERT INTO tasks (id, goal_id, user_id, title, duration_minutes, scheduled_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [taskId, goalId, userId, t.title, t.duration_minutes || 45, t.scheduled_date, t.description || '']
        );
      }
    }

    await connection.commit();
    return res.status(201).json({ message: '목표 및 학습 일정이 생성되었습니다.', goal_id: goalId });
  } catch (error: any) {
    await connection.rollback();
    return res.status(500).json({ error: '목표 생성 실패', details: error.message });
  } finally {
    connection.release();
  }
};

// 3. 캘린더/월별 Task 목록 조회 (GET /api/tasks?month=YYYY-MM 또는 date=YYYY-MM-DD)
export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { month, date } = req.query;

  try {
    let query = `
      SELECT t.*, g.name as goal_name, g.color as goal_color 
      FROM tasks t
      JOIN goals g ON t.goal_id = g.id
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    if (date) {
      query += ' AND t.scheduled_date = ?';
      params.push(date);
    } else if (month) {
      query += ' AND t.scheduled_date LIKE ?';
      params.push(`${month}%`);
    }

    query += ' ORDER BY t.scheduled_date ASC, t.created_at ASC';

    const [tasks] = await pool.query<RowDataPacket[]>(query, params);
    return res.status(200).json(tasks);
  } catch (error: any) {
    return res.status(500).json({ error: '일정 조회 실패', details: error.message });
  }
};

// 4. Task 완료 여부 토글 (PATCH /api/tasks/:id/toggle)
export const toggleTaskDone = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT is_done FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
    }

    const currentStatus = rows[0].is_done;
    const newStatus = !currentStatus;

    await pool.query(
      'UPDATE tasks SET is_done = ? WHERE id = ? AND user_id = ?',
      [newStatus, id, userId]
    );

    return res.status(200).json({ id, is_done: newStatus });
  } catch (error: any) {
    return res.status(500).json({ error: '일정 상태 변경 실패', details: error.message });
  }
};

