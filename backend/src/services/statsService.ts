export interface DailyStatItem {
  day: string;
  date: string;
  minutes: number;
  isPeak: boolean;
}

export interface GoalStatItem {
  id: string;
  name: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  progressPercent: number;
}

export interface StatsSummary {
  period: 'WEEKLY' | 'MONTHLY';
  totalFocusedMinutes: number;
  totalFocusedFormatted: string;
  completedTasksCount: number;
  totalTasksCount: number;
  achievementRate: number;
  chartData: DailyStatItem[];
  maxChartMinutes: number;
  goalStats: GoalStatItem[];
  aiFeedback: {
    tag: string;
    title: string;
    body: string;
  };
}

/**
 * 완료 과제 수와 전체 과제 수로부터 달성률(%)을 계산합니다.
 */
export function calculateAchievementRate(completed: number, total: number): number {
  if (total <= 0) return 0;
  const rate = Math.round((completed / total) * 100);
  return Math.min(100, Math.max(0, rate));
}

/**
 * 분 단위 집중 시간을 시/분 문자열로 변환합니다.
 */
export function formatFocusTime(minutes: number): { formatted: string; hours: number; mins: number } {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return {
    formatted: `${hours}시간 ${mins}분`,
    hours,
    mins,
  };
}

/**
 * 집중 시간 및 달성률에 따른 AI 피드백 문구를 생성합니다.
 */
export function generateStudyFeedback(achievementRate: number, totalMinutes: number): {
  tag: string;
  title: string;
  body: string;
} {
  if (achievementRate >= 80) {
    return {
      tag: 'AI STUDY INSIGHT • EXCELLENT',
      title: '놀라운 집중력으로 목표를 달성하고 있어요!',
      body: `달성률이 ${achievementRate}%에 달하며, 총 ${formatFocusTime(totalMinutes).formatted} 동안 흔들림 없이 몰입하셨습니다. 현재의 훌륭한 리듬을 꾸준히 유지해보세요.`,
    };
  } else if (achievementRate >= 50) {
    return {
      tag: 'AI STUDY INSIGHT • ON TRACK',
      title: '안정적인 페이스로 목표를 향해 나아가는 중이에요.',
      body: `계획의 절반 이상(${achievementRate}%)을 완수했습니다. 남은 과제들도 뽀모도로 타이머를 활용해 25분씩 나누어 진행하면 충분히 완료할 수 있습니다.`,
    };
  } else if (totalMinutes > 0) {
    return {
      tag: 'AI STUDY INSIGHT • STARTING UP',
      title: '시작이 반이에요, 오늘 누적된 학습 시간이 성장의 밑거름이 됩니다.',
      body: `총 ${formatFocusTime(totalMinutes).formatted}의 순공시간이 기록되었습니다. 중요한 핵심 과제부터 우선순위를 정해 하나씩 완료해보세요.`,
    };
  } else {
    return {
      tag: 'AI STUDY INSIGHT • READY',
      title: '오늘의 첫 뽀모도로 세션을 시작해보세요!',
      body: '아직 기록된 집중 시간이 없습니다. 작은 과제 하나를 정해 25분간 집중해보면 자연스럽게 몰입의 흐름을 탈 수 있습니다.',
    };
  }
}

/**
 * 일별 집중 시간 목록에서 최고 집중일(Peak)을 판별하여 차트 데이터를 구성합니다.
 */
export function normalizeChartData(
  items: { day: string; date: string; minutes: number }[]
): { chartData: DailyStatItem[]; maxMinutes: number } {
  if (!items || items.length === 0) {
    return { chartData: [], maxMinutes: 60 };
  }

  const maxVal = Math.max(...items.map(item => item.minutes), 0);
  const safeMax = Math.max(maxVal, 60); // 최소 스케일 60분

  const chartData: DailyStatItem[] = items.map(item => ({
    day: item.day,
    date: item.date,
    minutes: item.minutes,
    isPeak: maxVal > 0 && item.minutes === maxVal,
  }));

  return { chartData, maxMinutes: safeMax };
}

/**
 * 목표별 태스크 완료 현황을 집계하여 진행률을 계산합니다.
 */
export function aggregateGoalStats(
  goals: { id: string; name: string; color?: string; totalTasks: number; completedTasks: number }[]
): GoalStatItem[] {
  return goals.map(g => {
    const total = Math.max(0, g.totalTasks);
    const completed = Math.min(total, Math.max(0, g.completedTasks));
    const remaining = Math.max(0, total - completed);
    const progressPercent = calculateAchievementRate(completed, total);

    return {
      id: g.id,
      name: g.name,
      color: g.color || '#4F46E5',
      totalTasks: total,
      completedTasks: completed,
      remainingTasks: remaining,
      progressPercent,
    };
  });
}
