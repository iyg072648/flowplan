import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTableOfContents } from './ocrParser';

test('목차 텍스트에서 불필요한 기호 및 페이지 번호를 제거하고 단원 목록을 추출한다', () => {
  const sample = `
    목차 (Contents)
    1단원 지수와 로그 ....... 10p
    2단원 삼각함수 --- 45
    3단원 수열 ............ 90p
  `;
  const result = parseTableOfContents(sample);
  assert.deepEqual(result, ['1단원 지수와 로그', '2단원 삼각함수', '3단원 수열']);
});

test('빈 텍스트가 입력되면 빈 배열을 반환한다', () => {
  const result = parseTableOfContents('');
  assert.deepEqual(result, []);
});

test('중복 단원명은 하나로 정제한다', () => {
  const sample = `
    1단원 지수
    1단원 지수
    2단원 로그
  `;
  const result = parseTableOfContents(sample);
  assert.deepEqual(result, ['1단원 지수', '2단원 로그']);
});
