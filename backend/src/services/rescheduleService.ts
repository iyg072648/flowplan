export type RescheduleStrategy = 'EVEN_DISTRIBUTION' | 'DIFFICULTY_BASED';

export interface RescheduleTask {
  id: string;
  title: string;
  duration_minutes: number;
  scheduled_date: string;
  is_done?: boolean;
  difficulty?: number; // 1(쉬움) ~ 5(어려움), 기본 3
}

export interface RescheduleInput {
  delayedTasks: RescheduleTask[];
  remainingTasks?: RescheduleTask[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  availableDaysOfWeek?: number[]; // 0(일) ~ 6(토)
  strategy?: RescheduleStrategy;
  dailyMaxMinutes?: number;
}

export interface RescheduledItem {
  id: string;
  title: string;
  previous_date: string;
  new_date: string;
  duration_minutes: number;
}

export interface RescheduleResult {
  rescheduledTasks: RescheduledItem[];
  totalDelayedCount: number;
  strategy: RescheduleStrategy;
  dailyLoads: Record<string, number>; // 날짜별 누적 학습 시간(분)
}

// 1. 재배치 가용 날짜 산출 헬퍼
export function getAvailableDates(
  startDateStr: string,
  endDateStr: string,
  availableDays: number[] = [0, 1, 2, 3, 4, 5, 6]
): string[] {
  const dates: string[] = [];
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(current.getTime()) || isNaN(end.getTime()) || current > end) {
    return dates;
  }

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (availableDays.includes(dayOfWeek)) {
      dates.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// 2. 동적 재조정 알고리즘 메인 로직
export function calculateReschedule(input: RescheduleInput): RescheduleResult {
  const strategy = input.strategy || 'EVEN_DISTRIBUTION';
  const availableDays = input.availableDaysOfWeek && input.availableDaysOfWeek.length > 0
    ? input.availableDaysOfWeek
    : [0, 1, 2, 3, 4, 5, 6];

  const availableDates = getAvailableDates(input.startDate, input.endDate, availableDays);

  if (availableDates.length === 0) {
    throw new Error('재배치할 수 있는 남은 유효 날짜가 존재하지 않습니다.');
  }

  // 날짜별 기존 누적 부하(기존 미래 Task 분량) 초기화
  const dailyLoads: Record<string, number> = {};
  availableDates.forEach(date => {
    dailyLoads[date] = 0;
  });

  if (Array.isArray(input.remainingTasks)) {
    input.remainingTasks.forEach(task => {
      if (dailyLoads[task.scheduled_date] !== undefined) {
        dailyLoads[task.scheduled_date] += Number(task.duration_minutes) || 0;
      }
    });
  }

  const delayedTasks = [...input.delayedTasks];
  const rescheduledTasks: RescheduledItem[] = [];

  if (strategy === 'DIFFICULTY_BASED') {
    // 난이도 및 소요시간 기반 정렬: 난이도가 높고 시간이 긴 Task를 우선 배치 (Bin Packing 알고리즘)
    delayedTasks.sort((a, b) => {
      const diffA = a.difficulty || 3;
      const diffB = b.difficulty || 3;
      if (diffA !== diffB) {
        return diffB - diffA; // 난이도 내림차순
      }
      return (b.duration_minutes || 0) - (a.duration_minutes || 0); // 소요시간 내림차순
    });
  }

  // 지연된 Task들을 현재 부하가 가장 적은 날짜에 최적으로 분배
  for (const task of delayedTasks) {
    let minDate = availableDates[0];
    let minLoad = dailyLoads[minDate];

    for (const date of availableDates) {
      if (dailyLoads[date] < minLoad) {
        minLoad = dailyLoads[date];
        minDate = date;
      }
    }

    const duration = Number(task.duration_minutes) || 45;
    dailyLoads[minDate] += duration;

    rescheduledTasks.push({
      id: task.id,
      title: task.title,
      previous_date: task.scheduled_date,
      new_date: minDate,
      duration_minutes: duration,
    });
  }

  // new_date 순서대로 정렬하여 반환
  rescheduledTasks.sort((a, b) => a.new_date.localeCompare(b.new_date));

  return {
    rescheduledTasks,
    totalDelayedCount: delayedTasks.length,
    strategy,
    dailyLoads,
  };
}
