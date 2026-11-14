import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAvailableDates,
  calculateReschedule,
  RescheduleInput,
  RescheduleTask
} from './rescheduleService';

test('getAvailableDates: 지정된 기간 및 요일 필터링을 올바르게 수행한다', () => {
  // 2026-11-16(월) ~ 2026-11-20(금)
  // availableDays: [1, 3, 5] (월, 수, 금)
  const dates = getAvailableDates('2026-11-16', '2026-11-20', [1, 3, 5]);
  assert.deepEqual(dates, [
    '2026-11-16', // 월
    '2026-11-18', // 수
    '2026-11-20', // 금
  ]);
});

test('getAvailableDates: 시작일이 마감일보다 늦으면 빈 배열을 반환한다', () => {
  const dates = getAvailableDates('2026-11-25', '2026-11-20');
  assert.equal(dates.length, 0);
});

test('calculateReschedule (EVEN_DISTRIBUTION): 지연된 과제들을 가용 날짜에 고르게 분배한다', () => {
  const delayedTasks: RescheduleTask[] = [
    { id: 't1', title: '지연 과제 1', duration_minutes: 60, scheduled_date: '2026-11-10' },
    { id: 't2', title: '지연 과제 2', duration_minutes: 60, scheduled_date: '2026-11-11' },
    { id: 't3', title: '지연 과제 3', duration_minutes: 60, scheduled_date: '2026-11-12' },
  ];

  const input: RescheduleInput = {
    delayedTasks,
    startDate: '2026-11-16',
    endDate: '2026-11-18',
    strategy: 'EVEN_DISTRIBUTION',
  };

  const result = calculateReschedule(input);

  assert.equal(result.totalDelayedCount, 3);
  assert.equal(result.rescheduledTasks.length, 3);
  assert.equal(result.strategy, 'EVEN_DISTRIBUTION');

  // 3개 날짜(16일, 17일, 18일)에 각각 60분씩 균등 배분되었는지 검증
  assert.equal(result.dailyLoads['2026-11-16'], 60);
  assert.equal(result.dailyLoads['2026-11-17'], 60);
  assert.equal(result.dailyLoads['2026-11-18'], 60);
});

test('calculateReschedule: 기존 일정이 있는 날을 피해 부하가 적은 날짜에 우선 배정한다', () => {
  const delayedTasks: RescheduleTask[] = [
    { id: 't1', title: '밀린 공부', duration_minutes: 45, scheduled_date: '2026-11-10' },
  ];

  const remainingTasks: RescheduleTask[] = [
    // 16일에는 이미 120분의 과제가 배정되어 있음
    { id: 'r1', title: '기존 과제 1', duration_minutes: 120, scheduled_date: '2026-11-16' },
    // 17일에는 기존 과제 없음 (0분)
  ];

  const input: RescheduleInput = {
    delayedTasks,
    remainingTasks,
    startDate: '2026-11-16',
    endDate: '2026-11-17',
    strategy: 'EVEN_DISTRIBUTION',
  };

  const result = calculateReschedule(input);

  assert.equal(result.rescheduledTasks[0].new_date, '2026-11-17');
  assert.equal(result.dailyLoads['2026-11-16'], 120);
  assert.equal(result.dailyLoads['2026-11-17'], 45);
});

test('calculateReschedule (DIFFICULTY_BASED): 난이도가 높은 과제를 우선적으로 균형 배치한다', () => {
  const delayedTasks: RescheduleTask[] = [
    { id: 't-easy', title: '쉬운 과제', duration_minutes: 30, scheduled_date: '2026-11-09', difficulty: 1 },
    { id: 't-hard', title: '어려운 고난도 과제', duration_minutes: 90, scheduled_date: '2026-11-10', difficulty: 5 },
  ];

  const input: RescheduleInput = {
    delayedTasks,
    startDate: '2026-11-16',
    endDate: '2026-11-17',
    strategy: 'DIFFICULTY_BASED',
  };

  const result = calculateReschedule(input);

  assert.equal(result.strategy, 'DIFFICULTY_BASED');
  assert.equal(result.rescheduledTasks.length, 2);

  // 두 날짜에 하나씩 배분되었는지 확인
  const dates = result.rescheduledTasks.map(t => t.new_date);
  assert.ok(dates.includes('2026-11-16'));
  assert.ok(dates.includes('2026-11-17'));
});

test('calculateReschedule: 가용 날짜가 없으면 예외를 발생시킨다', () => {
  const input: RescheduleInput = {
    delayedTasks: [{ id: 't1', title: '과제', duration_minutes: 30, scheduled_date: '2026-11-10' }],
    startDate: '2026-11-20',
    endDate: '2026-11-15', // 유효하지 않은 기간
  };

  assert.throws(() => calculateReschedule(input), /유효 날짜가 존재하지 않습니다/);
});
