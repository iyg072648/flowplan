import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { parseTableOfContents } from '../utils/ocrParser';
import { splitTasksWithAI } from './aiService';
import { calculateReschedule } from './rescheduleService';
import {
  validateSessionInput,
  calculateTodaySummary,
  formatFocusedTime,
} from './timerService';
import {
  calculateAchievementRate,
  normalizeChartData,
  aggregateGoalStats,
  generateStudyFeedback,
  formatFocusTime,
} from './statsService';

const TEST_JWT_SECRET = 'flowplan_test_secret_key_2026';

test('E2E 연계 1: OCR 목차 정제 -> AI 단원 자동 분할 파이프라인 연동 검증', async () => {
  // 1. OCR 인식 텍스트 시뮬레이션
  const rawOcrText = `
    목차 (Contents)
    01 인문 예술 - 철학적 사유의 이해 ....... 12p
    02 사회 문화 - 시장 경제와 정책 ......... 34p
    03 과학 기술 - 양자역학과 컴퓨터 ......... 58p
    04 융합 복합 - 뇌과학과 인공지능 ......... 80p
  `;

  // 2. 목차 파서 정제
  const chapters = parseTableOfContents(rawOcrText);
  assert.equal(chapters.length, 4);
  assert.equal(chapters[0], '01 인문 예술 - 철학적 사유의 이해');
  assert.equal(chapters[3], '04 융합 복합 - 뇌과학과 인공지능');

  // 3. AI 기반 스케줄 분할 연동 (월~금: 1, 2, 3, 4, 5)
  const splitResult = await splitTasksWithAI({
    goalName: '수능특강 독서 완독',
    startDate: '2026-11-23', // 월요일
    endDate: '2026-11-27',   // 금요일
    studyDays: [1, 2, 3, 4, 5],
    dailyMinutes: 60,
    materials: chapters,
  });

  assert.equal(splitResult.total_tasks, 4);
  assert.equal(splitResult.tasks.length, 4);

  // 모든 태스크가 유효한 날짜 범위와 학습 시간을 가지는지 검증
  splitResult.tasks.forEach(task => {
    assert.ok(task.title.length > 0);
    assert.ok(task.scheduled_date >= '2026-11-23' && task.scheduled_date <= '2026-11-27');
    assert.ok(task.duration_minutes > 0);
  });
});

test('E2E 연계 2: 과거 미완료 과제 발생 -> 동적 재스케줄링 알고리즘 재배치 검증', () => {
  // 과거 밀린 과제 3개
  const delayedTasks = [
    { id: 'task-1', title: '01단원 지수함수', duration_minutes: 50, scheduled_date: '2026-11-18' },
    { id: 'task-2', title: '02단원 로그함수', duration_minutes: 45, scheduled_date: '2026-11-19' },
    { id: 'task-3', title: '03단원 삼각함수', duration_minutes: 60, scheduled_date: '2026-11-20' },
  ];

  // 미래 기존 과제 1개 (2026-11-24에 이미 부하 존재)
  const remainingTasks = [
    { id: 'task-4', title: '04단원 수열', duration_minutes: 90, scheduled_date: '2026-11-24' },
  ];

  const result = calculateReschedule({
    delayedTasks,
    remainingTasks,
    startDate: '2026-11-23',
    endDate: '2026-11-27',
    strategy: 'EVEN_DISTRIBUTION',
  });

  assert.equal(result.totalDelayedCount, 3);
  assert.equal(result.rescheduledTasks.length, 3);

  // 재조정된 모든 과제가 미래 가용 범위(11-23 ~ 11-27) 내로 재배치되었는지 확인
  result.rescheduledTasks.forEach(task => {
    assert.ok(task.new_date >= '2026-11-23');
    assert.ok(task.new_date <= '2026-11-27');
  });

  // 이미 90분 일정이 있는 2026-11-24 외 다른 날짜들에 부하가 균형 분배되었는지 확인
  assert.ok(result.dailyLoads['2026-11-23'] > 0);
  assert.ok(result.dailyLoads['2026-11-25'] > 0);
});

test('E2E 연계 3: 뽀모도로 타이머 세션 기록 -> 일간/주간 통계 및 대시보드 반영 검증', () => {
  // 1. 타이머 입력값 유효성 검증
  const sessionInput = {
    userId: 'user-integration-test',
    taskId: 'task-math-01',
    focusedMinutes: 50,
    startTime: '2026-11-21T09:00:00Z',
    endTime: '2026-11-21T09:50:00Z',
  };
  const val = validateSessionInput(sessionInput);
  assert.equal(val.valid, true);

  // 2. 당일 세션 요약 집계 검증
  const todaySessions = [
    { focused_minutes: 50, start_time: '2026-11-21T09:00:00Z' },
    { focused_minutes: 25, start_time: '2026-11-21T10:00:00Z' },
    { focused_minutes: 25, start_time: '2026-11-21T11:00:00Z' },
  ];
  const todaySummary = calculateTodaySummary(todaySessions);
  assert.equal(todaySummary.totalFocusedMinutes, 100);
  assert.equal(todaySummary.sessionCount, 3);
  assert.equal(todaySummary.pomodoroCycles, 4); // 100 / 25 = 4 사이클
  assert.equal(formatFocusedTime(todaySummary.totalFocusedMinutes), '1시간 40분');

  // 3. 통계 차트 및 목표 달성률 집계 연동
  const dailyRaw = [
    { day: '목', date: '2026-11-19', minutes: 50 },
    { day: '금', date: '2026-11-20', minutes: 75 },
    { day: '토', date: '2026-11-21', minutes: 100 },
  ];
  const { chartData, maxMinutes } = normalizeChartData(dailyRaw);
  assert.equal(maxMinutes, 100);
  assert.equal(chartData[2].isPeak, true); // 토요일(오늘)이 최고 집중일

  // 목표 달성률 및 피드백 검증
  const goalStats = aggregateGoalStats([
    { id: 'g1', name: '수학 1등급', totalTasks: 10, completedTasks: 8 },
  ]);
  assert.equal(goalStats[0].progressPercent, 80);
  assert.equal(goalStats[0].remainingTasks, 2);

  const feedback = generateStudyFeedback(80, 100);
  assert.equal(feedback.tag, 'AI STUDY INSIGHT • EXCELLENT');
});

test('E2E 연계 4: JWT 인증 토큰 라이프사이클 및 보안 검증', () => {
  const payload = { id: 'usr-secure-test', nickname: '보안테스터' };

  // 정상 토큰 서명 및 검증
  const validToken = jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(validToken, TEST_JWT_SECRET) as any;
  assert.equal(decoded.id, 'usr-secure-test');
  assert.equal(decoded.nickname, '보안테스터');

  // 잘못된 비밀키로 서명된 토큰 거부 검증
  const invalidToken = jwt.sign(payload, 'wrong_secret_key');
  assert.throws(() => {
    jwt.verify(invalidToken, TEST_JWT_SECRET);
  });
});

test('E2E 연계 5: 경계값(Boundary/Edge Case) 및 0분/빈 데이터 무결성 검증', () => {
  // 1. 전체 과제가 0개일 때 달성률 안전 연산 (0 나누기 에러 방지)
  assert.equal(calculateAchievementRate(0, 0), 0);
  assert.equal(calculateAchievementRate(5, 0), 0);

  // 2. 음수 또는 비정상 분 수 안전 포맷팅
  assert.deepEqual(formatFocusTime(-10), { formatted: '0시간 0분', hours: 0, mins: 0 });

  // 3. 타이머 종료 시간이 시작 시간보다 앞서는 오류 입력 차단
  const invalidTimeVal = validateSessionInput({
    userId: 'u1',
    focusedMinutes: 30,
    startTime: '2026-11-21T12:00:00Z',
    endTime: '2026-11-21T11:00:00Z',
  });
  assert.equal(invalidTimeVal.valid, false);

  // 4. 빈 차트 데이터 정상 스케일(60분) 유지
  const emptyChart = normalizeChartData([]);
  assert.equal(emptyChart.maxMinutes, 60);
  assert.equal(emptyChart.chartData.length, 0);
});
