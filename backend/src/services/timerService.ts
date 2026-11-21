export interface TimerSessionInput {
  userId: string;
  taskId?: string | null;
  focusedMinutes: number;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

export interface TodayStudySummary {
  totalFocusedMinutes: number;
  totalFocusedSeconds: number;
  sessionCount: number;
  pomodoroCycles: number;
  formattedTime: string; // "0시간 35분"
}

/**
 * 분 단위 집중 시간을 시/분 문자열로 변환 (예: 95분 -> "1시간 35분")
 */
export function formatFocusedTime(minutes: number): string {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 타이머 세션 입력 데이터 유효성 검증
 */
export function validateSessionInput(input: TimerSessionInput): { valid: boolean; error?: string } {
  if (!input.userId) {
    return { valid: false, error: '유효한 사용자 ID가 필요합니다.' };
  }

  if (input.focusedMinutes <= 0) {
    return { valid: false, error: '집중 시간은 0분보다 커야 합니다.' };
  }

  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: '유효하지 않은 날짜/시간 형식입니다.' };
  }

  if (end < start) {
    return { valid: false, error: '종료 시간은 시작 시간보다 이후여야 합니다.' };
  }

  return { valid: true };
}

/**
 * 세션 목록을 바탕으로 오늘 학습 요약 통계 계산
 */
export function calculateTodaySummary(
  sessions: Array<{ focused_minutes: number; start_time?: string }>
): TodayStudySummary {
  const totalMinutes = sessions.reduce((acc, cur) => acc + (cur.focused_minutes || 0), 0);
  const sessionCount = sessions.length;
  // 1 뽀모도로 사이클 = 25분 기준
  const pomodoroCycles = Math.floor(totalMinutes / 25);

  return {
    totalFocusedMinutes: totalMinutes,
    totalFocusedSeconds: totalMinutes * 60,
    sessionCount,
    pomodoroCycles,
    formattedTime: formatFocusedTime(totalMinutes),
  };
}
