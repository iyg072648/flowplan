import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface SplitTaskInput {
  goalName?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  studyDays?: number[]; // 0: 일요일 ~ 6: 토요일 (기본값: 매일)
  dailyMinutes?: number; // 일일 권장 학습 시간 (기본값 60분)
  materials: string[]; // 교재 목차 또는 학습 단원 목록
}

export interface GeneratedTask {
  title: string;
  scheduled_date: string;
  duration_minutes: number;
  description: string;
}

export interface SplitTaskResult {
  tasks: GeneratedTask[];
  source: 'openai' | 'fallback';
  model?: string;
  total_tasks: number;
}

// 1. 기간 내 학습 가능한 날짜 목록 계산 헬퍼
export function getAvailableDates(startDateStr: string, endDateStr: string, studyDays: number[]): string[] {
  const dates: string[] = [];
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);

  // 유효하지 않은 날짜 처리
  if (isNaN(current.getTime()) || isNaN(end.getTime()) || current > end) {
    return dates;
  }

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (studyDays.includes(dayOfWeek)) {
      dates.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// 2. OpenAI 프롬프트 템플릿 생성
export function buildPrompt(input: SplitTaskInput, availableDates: string[]) {
  const systemPrompt = `너는 수험생의 학습 스케줄을 짜주는 전문적인 스터디 플래너야. 
주어진 목차와 기간, 학습 가능 날짜를 분석하여 매일 수행 가능한 현실적인 학습 분량의 일정(Task)을 JSON 형태로 반환해.
반드시 다음 JSON 형식을 엄격히 준수하여 응답해야 해:
{
  "tasks": [
    {
      "title": "단원명 또는 세부 학습 주제",
      "scheduled_date": "YYYY-MM-DD",
      "duration_minutes": 60,
      "description": "해당 날짜에 학습할 세부 가이드 또는 요약"
    }
  ]
}`;

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const allowedDayStr = (input.studyDays && input.studyDays.length > 0)
    ? input.studyDays.map(d => dayNames[d] + '요일').join(', ')
    : '매일';

  const userPrompt = `[학습 목표 정보]
- 목표명: ${input.goalName || '학습 목표 달성'}
- 전체 기간: ${input.startDate} ~ ${input.endDate} (총 배정 가능일: ${availableDates.length}일)
- 학습 가능 요일: ${allowedDayStr}
- 일일 권장 학습 시간: ${input.dailyMinutes || 60}분

[학습 가능 날짜 목록]
${availableDates.slice(0, 50).join(', ')}${availableDates.length > 50 ? ' ... 외' : ''}

[학습 목차 및 단원 분량]
${input.materials.map((m, idx) => `${idx + 1}. ${m}`).join('\n')}

위 목차 분량을 학습 가능 날짜들에 맞춰 학습 부담이 한 날에 쏠리지 않도록 고르게 분배해줘.`;

  return { systemPrompt, userPrompt };
}

// 3. Fallback 분할 알고리즘 (API Key 미설정 또는 호출 실패 시)
export function fallbackSplit(input: SplitTaskInput, availableDates: string[]): GeneratedTask[] {
  if (availableDates.length === 0 || input.materials.length === 0) {
    return [];
  }

  const tasks: GeneratedTask[] = [];
  const duration = input.dailyMinutes || 60;
  const materials = input.materials;

  // 자료 수와 배정 가능 날짜 수에 맞춰 고르게 분배
  materials.forEach((material, index) => {
    const targetDateIndex = Math.min(
      Math.floor((index / materials.length) * availableDates.length),
      availableDates.length - 1
    );
    const date = availableDates[targetDateIndex];

    tasks.push({
      title: material,
      scheduled_date: date,
      duration_minutes: duration,
      description: `${material} 집중 학습 및 복습`
    });
  });

  return tasks;
}

// 4. OpenAI API 연동 및 목표 분할 메인 함수
export async function splitTasksWithAI(input: SplitTaskInput): Promise<SplitTaskResult> {
  const studyDays = input.studyDays && input.studyDays.length > 0
    ? input.studyDays
    : [0, 1, 2, 3, 4, 5, 6];

  const availableDates = getAvailableDates(input.startDate, input.endDate, studyDays);
  if (availableDates.length === 0) {
    throw new Error('학습 가능한 유효 날짜가 존재하지 않습니다. 시작일과 종료일, 학습 요일을 확인해주세요.');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // API 키가 없으면 안전하게 Fallback 모드로 스케줄 분할
  if (!apiKey || apiKey.trim() === '' || apiKey === 'mock_key') {
    const fallbackTasks = fallbackSplit(input, availableDates);
    return {
      tasks: fallbackTasks,
      source: 'fallback',
      total_tasks: fallbackTasks.length
    };
  }

  try {
    const { systemPrompt, userPrompt } = buildPrompt(input, availableDates);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        temperature: 0.2, // 일관되고 정밀한 스케줄 생성을 위해 낮은 온도 유지
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15초 타임아웃
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 응답 데이터가 비어있습니다.');
    }

    const parsed = JSON.parse(content);
    const tasks: GeneratedTask[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];

    // 생성된 Task 유효성 검사 및 정제
    const validatedTasks = tasks.map((t, idx) => ({
      title: t.title || `학습 과제 ${idx + 1}`,
      scheduled_date: t.scheduled_date || availableDates[idx % availableDates.length],
      duration_minutes: Number(t.duration_minutes) || input.dailyMinutes || 60,
      description: t.description || ''
    }));

    return {
      tasks: validatedTasks,
      source: 'openai',
      model: model,
      total_tasks: validatedTasks.length
    };
  } catch (error: any) {
    console.warn(`⚠️ OpenAI API 호출 실패, Fallback 분할 알고리즘으로 전환: ${error.message}`);
    const fallbackTasks = fallbackSplit(input, availableDates);
    return {
      tasks: fallbackTasks,
      source: 'fallback',
      total_tasks: fallbackTasks.length
    };
  }
}
