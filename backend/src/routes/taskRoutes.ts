import { Router } from 'express';
import {
  getMyGoals,
  createGoalWithTasks,
  getTasks,
  toggleTaskDone,
  rescheduleTasks,
} from '../controllers/taskController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// 모든 일정/목표 API는 JWT 인증 필요
router.use(authenticateJWT);

router.get('/goals', getMyGoals);
router.post('/goals', createGoalWithTasks);
router.get('/tasks', getTasks);
router.patch('/tasks/:id/toggle', toggleTaskDone);
router.post('/tasks/reschedule', rescheduleTasks);

export default router;

