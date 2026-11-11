import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { splitTasksWithAI, SplitTaskInput } from '../services/aiService';

export const handleSplitTasks = async (req: AuthRequest, res: Response) => {
  try {
    const {
      goal_name,
      goalName,
      start_date,
      startDate,
      end_date,
      endDate,
      study_days,
      studyDays,
      daily_minutes,
      dailyMinutes,
      materials,
      text
    } = req.body;

    const start = startDate || start_date;
    const end = endDate || end_date;

    if (!start || !end) {
      return res.status(400).json({
        error: '시작일(startDate / start_date)과 종료일(endDate / end_date)은 필수입니다.'
      });
    }

    let parsedMaterials: string[] = [];
    if (Array.isArray(materials)) {
      parsedMaterials = materials.map(m => String(m).trim()).filter(Boolean);
    } else if (typeof materials === 'string') {
      parsedMaterials = materials.split('\n').map(s => s.trim()).filter(Boolean);
    } else if (typeof text === 'string') {
      parsedMaterials = text.split('\n').map(s => s.trim()).filter(Boolean);
    }

    if (parsedMaterials.length === 0) {
      return res.status(400).json({
        error: '분할할 목차 또는 학습 자료 목록(materials 또는 text)이 비어있습니다.'
      });
    }

    const input: SplitTaskInput = {
      goalName: goalName || goal_name,
      startDate: start,
      endDate: end,
      studyDays: studyDays || study_days,
      dailyMinutes: dailyMinutes || daily_minutes,
      materials: parsedMaterials
    };

    const result = await splitTasksWithAI(input);

    return res.status(200).json({
      success: true,
      message: '학습 목표 일정이 성공적으로 분할되었습니다.',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      error: '목표 자동 분할 실패',
      details: error.message
    });
  }
};
