# Development Guide (개발 가이드)

FlowPlan 팀 프로젝트 협업을 위한 브랜치 전략, 커밋 규칙, 코드 리뷰 정책 및 아키텍처 가이드입니다.

---

## 📌 목차
1. [브랜치 전략 (Feature Branch Workflow)](#1-브랜치-전략-feature-branch-workflow)
2. [커밋 컨벤션 (Conventional Commits)](#2-커밋-컨벤션-conventional-commits)
3. [Pull Request 및 코드 리뷰 규칙](#3-pull-request-및-코드-리뷰-규칙)
4. [프로젝트 아키텍처](#4-프로젝트-아키텍처)
5. [관련 문서](#5-관련-문서)

---

## 1. 브랜치 전략 (Feature Branch Workflow)
모든 새로운 기능 개발 및 버그 수정은 별도의 브랜치에서 진행하며, 완료 후 PR을 통해 `main` 브랜치로 병합합니다.

- **`main`**: 상시 배포 가능한 운영 브랜치
- **`feature/{기능명}`**: 새로운 기능 개발 브랜치 (예: `feature/auth-kakao`, `feature/goal-create`)
- **`fix/{버그명}`**: 버그 수정 브랜치 (예: `fix/token-expiration`)
- **`docs/{문서명}`**: 문서 작업 브랜치

```bash
# 브랜치 생성 및 전환 예시
git checkout main
git pull origin main
git checkout -b feature/auth-kakao
```

---

## 2. 커밋 컨벤션 (Conventional Commits)
모든 커밋 메시지는 `타입(스코프): 제목 (#이슈번호)` 형식을 준수합니다.

| 타입 (Type) | 설명 | 예시 |
| :--- | :--- | :--- |
| **`feat`** | 새로운 기능 추가 | `feat(auth): 카카오 소셜 로그인 연동 (#7)` |
| **`fix`** | 버그 수정 | `fix(timer): 뽀모도로 타이머 시간 리셋 오류 수정 (#15)` |
| **`docs`** | 문서 변경 (README, Wiki 등) | `docs: Wiki 가이드 문서 추가` |
| **`chore`** | 빌드 작업, 패키지 매니저 설정 | `chore: prettier 및 eslint 설정 추가 (#6)` |
| **`ci`** | CI/CD 파이프라인 변경 | `ci: DORA 메트릭 수집 워크플로우 갱신` |

---

## 3. Pull Request 및 코드 리뷰 규칙
1. **PR 템플릿 작성:** 작업 요약, 관련 이슈 번호(`Closes #이슈번호`), 체크리스트를 필수 포함합니다.
2. **구조화된 코드 리뷰 피드백 태그:**
   - **`[MUST]`**: 반드시 수정해야 머지 승인이 가능한 필수 수정 사항 (보안 결함, 런타임 크래시 등)
   - **`[SHOULD]`**: 적극 권장되는 개선 사항 (성능 개선, 예외 처리 세분화 등)
   - **`[IMO]`**: 리뷰어의 개인적인 제안이나 단순 참고 의견
3. 최소 1인 이상의 승인 후 `main` 브랜치로 Sqush/Merge합니다.

---

## 4. 프로젝트 아키텍처
- **Frontend (`frontend/`):** React Native / Expo 기반 화면 및 컴포넌트 분리 (`src/screens/`, `src/components/`)
- **Backend (`backend/`):** Express + TypeScript 기반 3계층 구조:
  - `routes/`: URL 라우팅 및 미들웨어 적용
  - `controllers/`: 비즈니스 로직 및 외부 API 연동
  - `config/`: MySQL 커넥션 풀 및 전역 설정

---

## 5. 관련 문서
- 🚀 로컬 환경 설치 및 실행: **[Getting Started](Getting-Started.md)**
- 🚨 개발 중 오류 해결: **[Troubleshooting](Troubleshooting.md)**
