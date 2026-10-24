# Troubleshooting (문제 해결 가이드)

FlowPlan 개발 및 실행 중 자주 발생하는 오류 상황과 대처 방법입니다.

---

## 📌 목차
1. [MySQL DB 연결 오류 (ECONNREFUSED)](#1-mysql-db-연결-오류-econnrefused)
2. [카카오 OAuth 401 Unauthorized 에러](#2-카카오-oauth-401-unauthorized-에러)
3. [JWT 토큰 만료 또는 403 Forbidden 에러](#3-jwt-토큰-만료-또는-403-forbidden-에러)
4. [프론트엔드 API 통신 실패 (Network Error)](#4-프론트엔드-api-통신-실패-network-error)
5. [Git Push 동시성 충돌 (rejected - fetch first)](#5-git-push-동시성-충돌-rejected---fetch-first)
6. [관련 문서](#6-관련-문서)

---

## 1. MySQL DB 연결 오류 (ECONNREFUSED)
- **증상:** `connect ECONNREFUSED 127.0.0.1:3306` 에러와 함께 백엔드 기동 실패
- **원인:** 로컬 MySQL 서비스가 실행 중이지 않거나 `.env` 접속 정보가 틀린 경우
- **해결 방법:**
  1. MySQL 서비스가 켜져 있는지 확인:
     ```powershell
     # Windows 서비스 상태 확인
     Get-Service -Name MySQL*
     # MySQL 서비스 시작
     Start-Service -Name MySQL80
     ```
  2. `backend/.env` 파일의 `DB_USER`, `DB_PASSWORD`, `DB_NAME`이 올바른지 확인합니다.

---

## 2. 카카오 OAuth 401 Unauthorized 에러
- **증상:** `카카오 계정 인증에 실패했습니다.` 응답 발생
- **원인:** 전송된 카카오 Access Token이 만료되었거나, 잘못된 토큰을 보낸 경우
- **해결 방법:**
  - 개발/테스트 시에는 백엔드에 내장된 모의 토큰인 `mock_kakao_token`을 요청 본문으로 전달하면 실제 카카오 서버 검증 없이 테스트용 유저로 자동 승인됩니다.

---

## 3. JWT 토큰 만료 또는 403 Forbidden 에러
- **증상:** `유효하지 않거나 만료된 토큰입니다.` 응답 발생
- **원인:** `Authorization: Bearer {token}` 헤더가 누락되었거나 만료 기간(기본 7일) 초과
- **해결 방법:**
  - `POST /api/auth/kakao`로 다시 로그인하여 새로운 토큰을 발급받아 헤더에 첨부합니다.

---

## 4. 프론트엔드 API 통신 실패 (Network Error)
- **증상:** 실기기나 모바일 에뮬레이터에서 로그인 요청 시 응답이 오지 않음
- **원인:** 모바일 환경에서 `localhost`는 컴퓨터 PC가 아니라 모바일 기기 자체를 가리킴
- **해결 방법:**
  - Android 에뮬레이터: `http://10.0.2.2:5000` 사용
  - 실제 스마트폰: 컴퓨터와 같은 Wi-Fi에 연결 후 PC의 로컬 IP(예: `http://192.168.0.x:5000`)로 지정

---

## 5. Git Push 동시성 충돌 (rejected - fetch first)
- **증상:** `git push` 시 `Updates were rejected because the remote contains work that you do not have locally` 에러
- **원인:** GitHub Actions 봇이 DORA 메트릭(`dora-metrics.json`)을 푸시하여 원격 브랜치가 앞서 있는 경우
- **해결 방법:**
  ```bash
  git pull --rebase origin main
  git push origin main
  ```

---

## 6. 관련 문서
- 🚀 프로젝트 초기 설치 및 시작: **[Getting Started](Getting-Started.md)**
- 🛠️ 브랜치 및 커밋 컨벤션: **[Development Guide](Development-Guide.md)**
