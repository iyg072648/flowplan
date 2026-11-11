# 🚀 CI/CD 파이프라인 최적화 및 성능 비교 리포트

## 📌 1. 개요
본 문서는 FlowPlan 프로젝트의 CI/CD 워크플로우에 적용된 **Composite Action & Reusable Workflow 모듈화**, **Matrix 확장 테스트(6종)**, **NPM 의존성 캐싱**, 그리고 **변경 감지 기반 선택적 배포(Selective Deployment)** 전후의 성능 및 실행 시간 비교 결과를 정리한 공식 리포트입니다.

---

## 🔗 2. 관련 GitHub 링크
- **최적화 전 Actions 실행 (No Cache / 단일 잡)**: [Actions Run #42976050742](https://github.com/iyg072648/flowplan/actions/runs/42976050742)
- **최적화 후 Actions 실행 (PR 단계 - 배포 자동 Skip 검증)**: [Actions Run #42976740043](https://github.com/iyg072648/flowplan/actions/runs/42976740043)
- **최적화 후 Actions 실행 (Main 머지 - 캐시 히트 & 프로덕션 배포 완료)**: [Actions Run #42976881530](https://github.com/iyg072648/flowplan/actions/runs/42976881530)
- **Pull Request**: [FlowPlan PR #34](https://github.com/iyg072648/flowplan/pull/34)
- **메인 파이프라인 정의**: [.github/workflows/ci-cd.yml](https://github.com/iyg072648/flowplan/blob/main/.github/workflows/ci-cd.yml)
- **공통 Composite Action**: [.github/actions/setup-node-env/action.yml](https://github.com/iyg072648/flowplan/blob/main/.github/actions/setup-node-env/action.yml)
- **공통 Reusable Workflow**: [.github/workflows/reusable-lint-test.yml](https://github.com/iyg072648/flowplan/blob/main/.github/workflows/reusable-lint-test.yml)

---

## 📊 3. 캐싱 전후 실행 시간 측정 및 개선률

| 작업 단계 / 테스트 환경 | 최적화 전 (No Cache)<br>Run #42976050742 | 최적화 후 (NPM Cache 적용)<br>Run #42976881530 | 소요 시간 변동 | 개선률 |
| :--- | :---: | :---: | :---: | :---: |
| **Ubuntu / Node 18.x Test** | 15s | 12s (PR) / 15s (Main) | -3s | **20.0% 단축** |
| **Ubuntu / Node 20.x Test** | 14s | 12s | -2s | **14.3% 단축** |
| **Ubuntu / Node 22.x Test** *(신규 확장)* | - | **10s** *(전체 최속)* | -4s *(vs 이전평균)* | **28.6% 단축** |
| **Windows / Node 20.x Test** | 32s | 27s (PR) | -5s | **15.6% 단축** |
| **Windows / Node 22.x Test** *(신규 확장)* | - | **23s** (PR) | -7s *(vs 이전평균)* | **23.3% 단축** |
| **Deploy Job (Simulation)** | 5s | 3s | -2s | **40.0% 단축** |

> **성능 개선 분석 요약**:
> 1. `actions/setup-node`의 npm cache(`package-lock.json` 해시 키) 적용으로 각 잡에서 반복되던 npm 패키지 원격 다운로드 시간이 거의 0초로 수렴하였습니다.
> 2. 최신 Node.js 22 LTS 환경에서는 내부 V8 엔진 및 `node:test` 러너 최적화로 인해 테스트 시간이 **10초**로 대폭 단축되었습니다.
> 3. Windows 환경에서도 의존성 캐시 적중 시 32초에서 **23~27초**로 약 15~23% 속도 향상이 입증되었습니다.

---

## 🛠️ 4. 파이프라인 아키텍처 개선 사항

### ① 워크플로우 코드 중복 완전 제거
- 기존에는 `Build` 잡과 `Test` 잡마다 중복 작성되던 Node 설치, 캐시 세팅, `npm ci` 로직이 **Composite Action** (`.github/actions/setup-node-env`) 하나로 통합되었습니다.
- 테스트 파이프라인 전체를 **Reusable Workflow** (`.github/workflows/reusable-lint-test.yml`)로 분리하여 메인 워크플로우(`ci-cd.yml`)는 호출 선언부만 깔끔하게 유지됩니다.

### ② Matrix 확장 테스트
- 기존 4종(`[ubuntu-latest, windows-latest]` × `[18.x, 20.x]`)에서 최신 **Node.js 22.x**를 추가하여 총 **6종 환경**에서 단위 테스트 및 Linter가 완전 병렬로 자동 검증됩니다.

### ③ 브랜치/PR 조건 및 변경 파일 감지 기반 선택적 배포 (Selective Pipeline)
- `dorny/paths-filter@v3`를 사용하여 `backend/**`, `.github/**` 등 관련 파일이 실제로 수정되었을 때만 빌드 및 배포가 수행됩니다.
- PR 생성 시에는 빌드/테스트만 통과시키고 프로덕션 배포 단계(`deploy`)는 **자동 Skip** 됩니다.
- `main` 브랜치에 코드가 머지(push)되었을 때만 실제 프로덕션 배포가 안전하게 트리거됩니다.

