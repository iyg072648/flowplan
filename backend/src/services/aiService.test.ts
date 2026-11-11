import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAvailableDates,
  buildPrompt,
  fallbackSplit,
  splitTasksWithAI,
  SplitTaskInput
} from './aiService';

test('getAvailableDates: 지정된 요일의 날짜만 정확히 필터링한다', () => {
  // 2026-11-09(월) ~ 2026-11-15(일)
  // studyDays: [1, 3, 5] (월, 수, 금)
  const dates = getAvailableDates('2026-11-09', '2026-11-15', [1, 3, 5]);
  assert.deepEqual(dates, [
    '2026-11-09', // 월
    '2026-11-11', // 수
    '2026-11-13'  // 금
  ]);
});

test('getAvailableDates: 시작일이 종료일보다 늦으면 빈 배열을 반환한다', () => {
  const dates = getAvailableDates('2026-11-20', '2026-11-10', [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(dates.length, 0);
});

test('buildPrompt: 시스템 및 사용자 프롬프트를 규칙에 맞게 구성한다', () => {
  const input: SplitTaskInput = {
    goalName: '수능 수학 개념완성',
    startDate: '2026-11-01',
    endDate: '2026-11-10',
    studyDays: [1, 3, 5],
    dailyMinutes: 90,
    materials: ['1단원 지수함수', '2단원 로그함수', '3단원 삼각함수']
  };
  const availableDates = ['2026-11-02', '2026-11-04', '2026-11-06'];

  const { systemPrompt, userPrompt } = buildPrompt(input, availableDates);

  assert.ok(systemPrompt.includes('전문적인 스터디 플래너'));
  assert.ok(systemPrompt.includes('"tasks"'));
  assert.ok(userPrompt.includes('수능 수학 개념완성'));
  assert.ok(userPrompt.includes('1단원 지수함수'));
  assert.ok(userPrompt.includes('90분'));
});

test('fallbackSplit: 단원들을 학습 가능 날짜에 고르게 분배한다', () => {
  const input: SplitTaskInput = {
    goalName: '토익 보카 30일 완성',
    startDate: '2026-11-01',
    endDate: '2026-11-03',
    dailyMinutes: 45,
    materials: ['Day 1 단어 암기', 'Day 2 단어 암기', 'Day 3 단어 암기']
  };
  const availableDates = ['2026-11-01', '2026-11-02', '2026-11-03'];

  const tasks = fallbackSplit(input, availableDates);

  assert.equal(tasks.length, 3);
  assert.equal(tasks[0].title, 'Day 1 단어 암기');
  assert.equal(tasks[0].scheduled_date, '2026-11-01');
  assert.equal(tasks[0].duration_minutes, 45);
  assert.equal(tasks[2].scheduled_date, '2026-11-03');
});

test('splitTasksWithAI: API 키 부재 시 안전하게 Fallback 모드로 스케줄을 반환한다', async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const input: SplitTaskInput = {
      goalName: '컴퓨터 구조 기초',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      studyDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      materials: [
        '1장 컴퓨터 시스템 개요',
        '2장 데이터의 표현',
        '3장 중앙처리장치',
        '4장 기억장치'
      ]
    };

    const result = await splitTasksWithAI(input);

    assert.equal(result.source, 'fallback');
    assert.equal(result.total_tasks, 4);
    assert.equal(result.tasks.length, 4);
    assert.ok(result.tasks[0].title.includes('1장 컴퓨터 시스템 개요'));
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
  }
});
