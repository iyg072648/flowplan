# FlowPlan RESTful API 명세서

본 문서는 FlowPlan 서비스의 프론트엔드와 백엔드 간 통신을 위한 API 규격을 정의합니다.
기본 Base URL: `https://api.flowplan.com/v1` (예시)
응답 형식(Content-Type)은 공통적으로 `application/json`을 사용합니다.

---

## 1. Auth & User (인증 및 사용자)

### 1.1 소셜 로그인 및 토큰 발급
- **Endpoint:** `POST /api/auth/login`
- **Description:** Google/Kakao 로그인 성공 후 발급받은 OAuth 토큰을 서버로 전송하여 서비스 전용 JWT 토큰을 발급받습니다.
- **Request Body:**
  ```json
  {
    "provider": "google",
    "provider_token": "ya29.a0AfH6S..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJI...",
    "is_new_user": true
  }
  ```

### 1.2 사용자 프로필 조회
- **Endpoint:** `GET /api/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Response (200 OK):**
  ```json
  {
    "id": "uuid",
    "nickname": "홍길동",
    "target_exam": "수능"
  }
  ```

### 1.3 사용자 프로필 설정 (초기 설정 및 수정)
- **Endpoint:** `PUT /api/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Request Body:**
  ```json
  {
    "nickname": "열공홍길동",
    "target_exam": "공무원 시험"
  }
  ```

---

## 2. Goals (학습 목표)

### 2.1 내 목표 목록 조회
- **Endpoint:** `GET /api/goals`
- **Headers:** `Authorization: Bearer {token}`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "name": "수능 수학Ⅰ 개념 완성",
      "end_date": "2026-11-15",
      "color": "#4CAF50",
      "progress_percent": 45
    }
  ]
  ```

### 2.2 새 목표 생성 (AI 일정 생성 포함)
- **Endpoint:** `POST /api/goals`
- **Description:** 새로운 목표와 학습 분량을 전송하면, 서버(AI)가 이를 일별 Task로 분할하여 목표와 일정을 함께 생성합니다.
- **Request Body:**
  ```json
  {
    "name": "토익 850점 달성",
    "end_date": "2026-12-31",
    "color": "#9C27B0",
    "study_materials": [
      "1단원 명사와 대명사",
      "2단원 동사의 시제"
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "goal_id": "uuid",
    "message": "목표와 일정이 성공적으로 생성되었습니다."
  }
  ```

---

## 3. Tasks (할 일 및 일정)

### 3.1 특정 기간의 할 일 조회 (캘린더용)
- **Endpoint:** `GET /api/tasks`
- **Query Params:** `?start_date=2026-10-01&end_date=2026-10-31`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "goal_id": "uuid",
      "title": "1단원 명사와 대명사",
      "scheduled_date": "2026-10-05",
      "duration_minutes": 60,
      "is_done": false,
      "color": "#9C27B0"
    }
  ]
  ```

### 3.2 할 일 완료 상태 변경
- **Endpoint:** `PATCH /api/tasks/:task_id/status`
- **Request Body:**
  ```json
  {
    "is_done": true
  }
  ```

### 3.3 밀린 일정 AI 재조정 (Rescheduling)
- **Endpoint:** `POST /api/tasks/reschedule`
- **Description:** 기한이 지난 미완료 Task들을 옵션에 맞춰 미래의 날짜로 다시 분배합니다.
- **Request Body:**
  ```json
  {
    "strategy": "EVEN_DISTRIBUTION" // 또는 "DIFFICULTY_BASED"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "총 3개의 밀린 일정이 성공적으로 재배치되었습니다."
  }
  ```

---

## 4. Study Sessions & Stats (학습 세션 및 통계)

### 4.1 타이머 학습 기록 저장
- **Endpoint:** `POST /api/sessions`
- **Description:** 뽀모도로 타이머 등을 통해 측정한 실제 집중 시간을 저장합니다.
- **Request Body:**
  ```json
  {
    "task_id": "uuid",
    "focused_minutes": 25,
    "start_time": "2026-10-05T14:00:00Z",
    "end_time": "2026-10-05T14:25:00Z"
  }
  ```

### 4.2 주간/월간 통계 및 AI 피드백 조회
- **Endpoint:** `GET /api/stats`
- **Query Params:** `?period=weekly` (또는 `monthly`)
- **Response (200 OK):**
  ```json
  {
    "total_focused_minutes": 150,
    "tasks_completed": 5,
    "achievement_rate": 80,
    "chart_data": [
      { "label": "Mon", "value": 50 },
      { "label": "Tue", "value": 100 }
    ],
    "ai_feedback": "월요일보다 화요일에 집중력이 좋네요! 어려운 과목은 화요일에 배치해보세요."
  }
  ```
