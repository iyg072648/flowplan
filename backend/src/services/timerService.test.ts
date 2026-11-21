import test from 'node:test';
import assert from 'node:assert';
import {
  formatFocusedTime,
  validateSessionInput,
  calculateTodaySummary,
} from './timerService';

test('formatFocusedTime: 분 단위 시간을 시/분 문자열로 올바르게 변환한다', () => {
  assert.strictEqual(formatFocusedTime(0), '0시간 0분');
  assert.strictEqual(formatFocusedTime(35), '0시간 35분');
  assert.strictEqual(formatFocusedTime(60), '1시간 0분');
  assert.strictEqual(formatFocusedTime(95), '1시간 35분');
  assert.strictEqual(formatFocusedTime(150), '2시간 30분');
  assert.strictEqual(formatFocusedTime(-10), '0시간 0분'); // 음수 방어
});

test('validateSessionInput: 정상 입력 시 valid: true를 반환한다', () => {
  const result = validateSessionInput({
    userId: 'user-123',
    focusedMinutes: 25,
    startTime: '2026-11-21T14:00:00Z',
    endTime: '2026-11-21T14:25:00Z',
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.error, undefined);
});

test('validateSessionInput: 0 이하의 집중 시간은 유효하지 않다고 판정한다', () => {
  const result = validateSessionInput({
    userId: 'user-123',
    focusedMinutes: 0,
    startTime: '2026-11-21T14:00:00Z',
    endTime: '2026-11-21T14:00:00Z',
  });
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /0분보다 커야 합니다/);
});

test('validateSessionInput: 종료 시간이 시작 시간보다 앞서면 에러를 반환한다', () => {
  const result = validateSessionInput({
    userId: 'user-123',
    focusedMinutes: 30,
    startTime: '2026-11-21T15:00:00Z',
    endTime: '2026-11-21T14:30:00Z',
  });
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /종료 시간은 시작 시간보다 이후여야 합니다/);
});

test('calculateTodaySummary: 여러 세션의 총 집중 시간과 뽀모도로 사이클을 정확히 계산한다', () => {
  const sessions = [
    { focused_minutes: 25, start_time: '2026-11-21T10:00:00Z' },
    { focused_minutes: 25, start_time: '2026-11-21T11:00:00Z' },
    { focused_minutes: 30, start_time: '2026-11-21T13:00:00Z' },
  ];

  const summary = calculateTodaySummary(sessions);

  assert.strictEqual(summary.totalFocusedMinutes, 80);
  assert.strictEqual(summary.totalFocusedSeconds, 4800);
  assert.strictEqual(summary.sessionCount, 3);
  assert.strictEqual(summary.pomodoroCycles, 3); // 80 / 25 = 3
  assert.strictEqual(summary.formattedTime, '1시간 20분');
});
