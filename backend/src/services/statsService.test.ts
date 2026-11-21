import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAchievementRate,
  formatFocusTime,
  generateStudyFeedback,
  normalizeChartData,
  aggregateGoalStats,
} from './statsService';

test('calculateAchievementRate: 완료율(%)을 정확히 계산한다', () => {
  assert.equal(calculateAchievementRate(1, 4), 25);
  assert.equal(calculateAchievementRate(3, 3), 100);
  assert.equal(calculateAchievementRate(0, 5), 0);
  assert.equal(calculateAchievementRate(0, 0), 0);
  assert.equal(calculateAchievementRate(5, 4), 100); // 100% 초과 방지
});

test('formatFocusTime: 분 단위 집중 시간을 시/분으로 올바르게 변환한다', () => {
  assert.deepEqual(formatFocusTime(35), {
    formatted: '0시간 35분',
    hours: 0,
    mins: 35,
  });

  assert.deepEqual(formatFocusTime(125), {
    formatted: '2시간 5분',
    hours: 2,
    mins: 5,
  });

  assert.deepEqual(formatFocusTime(0), {
    formatted: '0시간 0분',
    hours: 0,
    mins: 0,
  });
});

test('generateStudyFeedback: 달성률 및 순공시간에 따라 알맞은 AI 피드백을 제공한다', () => {
  const highFeedback = generateStudyFeedback(85, 150);
  assert.equal(highFeedback.tag, 'AI STUDY INSIGHT • EXCELLENT');

  const midFeedback = generateStudyFeedback(60, 90);
  assert.equal(midFeedback.tag, 'AI STUDY INSIGHT • ON TRACK');

  const lowFeedback = generateStudyFeedback(20, 45);
  assert.equal(lowFeedback.tag, 'AI STUDY INSIGHT • STARTING UP');

  const zeroFeedback = generateStudyFeedback(0, 0);
  assert.equal(zeroFeedback.tag, 'AI STUDY INSIGHT • READY');
});

test('normalizeChartData: 최고 집중일(isPeak)을 식별하고 최소 60분 스케일을 보장한다', () => {
  const raw = [
    { day: '월', date: '2026-11-16', minutes: 40 },
    { day: '화', date: '2026-11-17', minutes: 120 },
    { day: '수', date: '2026-11-18', minutes: 60 },
  ];

  const { chartData, maxMinutes } = normalizeChartData(raw);

  assert.equal(maxMinutes, 120);
  assert.equal(chartData[1].isPeak, true);
  assert.equal(chartData[0].isPeak, false);
  assert.equal(chartData[2].isPeak, false);

  // 빈 배열 또는 0분일 때 기본 스케일 60분
  const emptyRes = normalizeChartData([]);
  assert.equal(emptyRes.maxMinutes, 60);
});

test('aggregateGoalStats: 각 목표별 진행률과 잔여 과제 수를 정확히 산출한다', () => {
  const goals = [
    { id: 'g1', name: '수능 수학', color: '#4F46E5', totalTasks: 10, completedTasks: 7 },
    { id: 'g2', name: '토익 영단어', color: '#10B981', totalTasks: 5, completedTasks: 0 },
  ];

  const stats = aggregateGoalStats(goals);

  assert.equal(stats.length, 2);
  assert.equal(stats[0].progressPercent, 70);
  assert.equal(stats[0].remainingTasks, 3);
  assert.equal(stats[1].progressPercent, 0);
  assert.equal(stats[1].remainingTasks, 5);
});
