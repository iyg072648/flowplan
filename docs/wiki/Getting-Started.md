# Getting Started (시작 가이드)

FlowPlan 프로젝트를 로컬 개발 환경에서 빠르게 설치하고 실행하는 방법입니다.

---

## 📌 목차
1. [사전 요구사항](#1-사전-요구사항)
2. [저장소 클론 및 패키지 설치](#2-저장소-클론-및-패키지-설치)
3. [환경변수(.env) 설정](#3-환경변수env-설정)
4. [백엔드 서버 실행](#4-백엔드-서버-실행)
5. [프론트엔드 앱 실행](#5-프론트엔드-앱-실행)
6. [관련 문서](#6-관련-문서)

---

## 1. 사전 요구사항
FlowPlan 개발을 시작하기 전에 아래 소프트웨어가 설치되어 있어야 합니다:
- **Node.js**: v18.0.0 이상
- **npm**: v9.0.0 이상
- **MySQL Server**: v8.0 이상 (포트: 3306)

---

## 2. 저장소 클론 및 패키지 설치
```bash
# 1. 저장소 복제
git clone https://github.com/iyg072648/flowplan.git
cd flowplan

# 2. 백엔드 패키지 설치
cd backend
npm install

# 3. 프론트엔드 패키지 설치
cd ../frontend
npm install
```

---

## 3. 환경변수(.env) 설정
`backend/.env.example` 파일을 복사하여 `backend/.env` 파일을 생성하고 설정값을 입력합니다:

```env
PORT=5000
NODE_ENV=development

# MySQL DB
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=flowplan

# JWT
JWT_SECRET=flowplan_jwt_secret_key_2026_secure
JWT_EXPIRES_IN=7d

# Kakao OAuth
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

---

## 4. 백엔드 서버 실행
```bash
cd backend
npm run dev
```
- 서버 진입점: `http://localhost:5000`
- 헬스체크 확인: `http://localhost:5000/health` (응답: `{"status":"ok"}`)

---

## 5. 프론트엔드 앱 실행
```bash
cd frontend
npm start
```

---

## 6. 관련 문서
- 🛠️ 브랜치 전략 및 코딩 컨벤션: **[Development Guide](Development-Guide.md)**
- 🚨 실행 오류 및 해결 방법: **[Troubleshooting](Troubleshooting.md)**
