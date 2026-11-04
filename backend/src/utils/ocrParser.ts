/**
 * OCR로 인식된 원문 텍스트에서 불필요한 페이지 번호, 특수기호를 제거하고
 * 학습 단위(단원/챕터)별 문자열 배열로 정제하는 파서 유틸리티
 */
export const parseTableOfContents = (rawText: string): string[] => {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  const lines = rawText.split(/\r?\n/);
  const cleanedChapters: string[] = [];

  for (let line of lines) {
    let trimmed = line.trim();

    // 1. 빈 줄 또는 너무 짧은 줄(1글자 기호 등) 무시
    if (trimmed.length <= 1) continue;

    // 2. 머리말, 판권, 차례, 목차 등 제외 키워드 필터링
    if (/^(목차|차례|contents|table of contents|머리말|프롤로그|index)$/i.test(trimmed)) {
      continue;
    }

    // 3. 우측에 붙은 점선(...) 및 페이지 번호 패턴 제거
    // 예: "1단원 지수와 로그 ....... 12p", "제2장 삼각함수 --- 45"
    trimmed = trimmed
      .replace(/[\.·\-~_]{2,}\s*\d+.*$/g, '') // "...... 12" 패턴 제거
      .replace(/\s+(p\.|page\s*)?\d+\s*$/i, '') // 끝에 붙은 "12", "p.12", "12p" 제거
      .trim();

    // 정제 후에도 유의미한 길이가 남으면 목록에 추가
    if (trimmed.length > 1) {
      cleanedChapters.push(trimmed);
    }
  }

  // 중복 항목 제거
  return Array.from(new Set(cleanedChapters));
};
