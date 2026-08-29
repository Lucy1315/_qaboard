# Tasks: QANOW 질의응답 게시판

**Branch**: `001-qanow-qa-board` | **Date**: 2026-08-29
**입력**: [spec.md](./spec.md) · [design.md](./design.md) · [plan.md](./plan.md) ·
[data-model.md](./data-model.md) · [contracts/](./contracts/)

## 읽는 법

- 모든 태스크는 **요구사항 ID(FR/SC/US)** 와 **design.md 절 번호**를 인용한다(헌장 원칙 XII).
- `[P]`는 같은 Phase 안에서 **병렬 가능**(파일이 겹치지 않음)을 뜻한다.
- 구현은 **테스트 작성 → 실패 확인 → 구현 → 통과 → 커밋** 순서를 따른다.
- 커밋 전 `npm run verify`가 통과해야 한다. **실패한 태스크는 완료로 표시하지 않는다**(원칙 XIII).

## 진행 상황 (2026-08-29 갱신)

| Phase | 상태 | 비고 |
|---|---|---|
| Phase 1 프로젝트 설정 | ✅ 완료 (T001~T008) | `npm run verify` 6단계 통과 |
| Phase 2 디자인 시스템 | ✅ 완료 (T009~T020) | 대비 18/18, stylelint·eslint 강제 장치 작동 |
| Phase 3 세 화면·Mock | ✅ 완료 (T021~T031, T033, T034) | 테스트 41/41, 390px 가로 스크롤 0 |
| — T032 상태 필터 | ✅ 완료 | `FR-041` 승인(2026-08-29) 후 구현 |
| 게이트 G1 | ⚠️ 부분 | G1-c·d 통과. **G1-a·b(E2E·axe)는 Playwright 브라우저 미설치로 미실행** |
| Phase 4 design-sync | ⏸ 대기 | design-system 타입 프로젝트 신규 생성 승인 필요 |
| Phase 5~8 | ⏸ 대기 | 게이트 G2 미통과 |

## Phase 의존 관계 (고정)

```
Phase 1 ─→ Phase 2 ─→ Phase 3 ──┐
                                 ├─→ [게이트 G1: 로컬 UI 검증] ─→ Phase 4 ─→ [게이트 G2] ─→ Phase 5 ─→ Phase 6 ─┐
                                 │                                                                    └─→ Phase 7 ─→ Phase 8
```

| 게이트 | 위치 | 통과 조건 |
|---|---|---|
| **G1** | Phase 3 종료 후 | Mock 상태로 1440·390 E2E 통과, axe 0건, `npm run contrast` 통과, design.md 24절 A~H 자체 점검 |
| **G2** | Phase 4 종료 후 | `/design-sync` 완료 + 확정 시안 대비 CRITICAL·HIGH 0건 + 시각 회귀 기준선 생성 |

**Supabase(Phase 5~) 작업은 G2를 통과하기 전에 시작하지 않는다.**

---

## Phase 1. 프로젝트 설정 (T001–T008)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| ✅ **T001** | Vite + React + TypeScript(strict) 프로젝트 초기화 | 원칙 XI, 헌장 추가 제약 | — | `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` | `npm run dev`가 5174에서 뜬다 |
| ✅ **T002** | 개발 포트 고정(5174 / 5175)과 `dev`·`dev:supabase` 스크립트 | 헌장 추가 제약(3777~3779 회피) | — | `package.json`, `vite.config.ts` | 두 명령이 각각 5174·5175로 뜬다 |
| ✅ **T003** [P] | ESLint 설정. `react/no-danger`를 **error**로 | FR-028 | 23.3 | `eslint.config.js` | `dangerouslySetInnerHTML` 사용 시 lint 실패 |
| ✅ **T004** [P] | Stylelint 설정 — ① 색상 하드코딩 금지 ② `motion.css` 외 `animation` 금지 | FR-038, 원칙 VI·VII | 15, 22 | `.stylelintrc.json` | 위반 CSS를 넣으면 실패한다 |
| ✅ **T005** [P] | Vitest + Testing Library 설정 | 원칙 XIII | — | `vitest.config.ts`, `src/test/setup.ts` | `npm test`가 0개 테스트로 통과 |
| ✅ **T006** [P] | Playwright 설정 — `desktop-1440`·`mobile-390`·`reduced-motion` 3 프로젝트 | SC-007, FR-038 | 20, 22 | `playwright.config.ts` | 3 프로젝트가 목록에 나온다 |
| ✅ **T007** | `lib/env.ts` — 필수 변수의 **존재 + 비어 있지 않음** 검사, 실패 시 오류 화면 | plan.md 17절, research R8 | — | `src/lib/env.ts`, `src/main.tsx`, `.env.example` | 변수를 빈 문자열로 두면 흰 화면이 아니라 오류 화면이 뜬다 |
| ✅ **T008** | `npm run verify` 통합 스크립트(typecheck+lint+stylelint+test+contrast+build) | 원칙 XIII | 24 | `package.json` | 한 명령으로 6단계가 순서대로 돈다 |

---

## Phase 2. 디자인 시스템 기반 (T009–T020)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| ✅ **T009** | `tokens.css` — design.md 15절 토큰 전부. `--ink800` 제외, `--focusDark` 포함 | 원칙 VI·VIII | **15, 25(2·3번)** | `src/styles/tokens.css` | 15절 표의 모든 이름·값이 1:1로 존재 |
| ✅ **T010** | `scripts/contrast.ts` — 토큰 조합 대비 계산, 본문 4.5:1·비텍스트 3:1 미달 시 종료코드 1 | 원칙 VI, research R7 | **17** | `scripts/contrast.ts`, `package.json` | 토큰을 일부러 낮추면 실패한다 |
| ✅ **T011** | 타이포그래피 — `Gothic A1`·`IBM Plex Mono` 로딩, 16절 계층을 유틸 클래스로 | 원칙 VI, research R6 | **16** | `src/styles/base.css`, `index.html` | 브라우저에서 한글이 `Gothic A1`로 렌더된다(폰트 전송량 ≤150KB) |
| ✅ **T012** | `base.css` — reset, `body`, `a`/`a:hover`, `:focus-visible` 기본, `.surfaceDark` | FR-036, 원칙 VIII | 18, 21 | `src/styles/base.css` | 포커스 표시가 모든 요소에 보인다 |
| ✅ **T013** | `motion.css` — 애니메이션 5종을 `prefers-reduced-motion: no-preference` 안에만 정의 | **FR-038** | **22** | `src/styles/motion.css` | 감소 설정에서 5종 전부 정지. 다른 파일에 `animation`을 쓰면 T004가 실패 |
| ✅ **T014** | `Header` + Navigation — 항목 3개 고정, **햄버거 없음**, 역할 배지, 다크 포커스 링 | FR-020, FR-039 | **7, 20** | `src/components/layout/Header.tsx(+.module.css)` | 390px에서 접이식 메뉴 없이 3항목이 보인다. 키보드로 전 항목 도달 |
| ✅ **T015** [P] | `Page` · `PageHeader` · `Footer` — 최대 폭·여백 컨테이너 | FR-039 | **4, 8, 18** | `src/components/layout/*.tsx` | 폭이 1200/1120/960/720으로 적용된다 |
| ✅ **T016** [P] | `Button` — variant 5종 × 상태 5종, `loading`이 disabled+라벨 교체를 함께 처리 | FR-031, 원칙 VIII | **19.2** | `src/components/ui/Button.tsx` | 5×5 컴포넌트 테스트 통과. 터치 대상 ≥44px |
| ✅ **T017** [P] | `Input` · `Textarea` · `Field`(라벨·도움말·글자수·오류 묶음) | FR-023~026 | **19.3, 12** | `src/components/ui/{Input,Textarea,Field}.tsx` | 라벨 없이 렌더하면 타입 오류. `aria-describedby`·`aria-invalid` 연결 확인 |
| ✅ **T018** [P] | `Badge` — `children` 필수(텍스트 없는 배지 생성 불가), 7종 | **FR-030** | **19.5, 17** | `src/components/ui/Badge.tsx` | 회색조 변환 스냅샷에서 5상태가 구분된다 |
| ✅ **T019** | `StateBox` 5변형 + 문구 상수 파일 | FR-029, FR-032 | **14** | `src/components/ui/StateBox.tsx`, `stateCopy.ts` | 14절 표의 문구와 1:1 일치. 예외 메시지 노출 없음 |
| ✅ **T020** | `Skeleton` — 목록 행 **58px 고정** 높이 | FR-029 | **11.2, 14** | `src/components/ui/Skeleton.tsx` | 실제 행과 높이가 같아 레이아웃이 튀지 않는다 |

---

## Phase 3. 세 핵심 화면과 Mock Data (T021–T034)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| ✅ **T021** | 메인 Hero — eyebrow·제목·보조 문구·CTA 2개·안내. 비회원 CTA는 로그인 안내로 이동 | FR-033, **FR-034** | **2, 9** | `src/components/hero/Hero.tsx`, `src/pages/HomePage.tsx` | 문구가 2절 표와 글자까지 일치. 비회원 CTA 동작 확인 |
| ✅ **T022** | `AuroraBackdrop` — Aurora 3광원 + Grid + **Scrim** 3겹 | FR-035, 원칙 VI | **10.1~10.3** | `src/components/hero/AuroraBackdrop.tsx` | Scrim 제거 시 대비 테스트가 실패해야 한다(존재 검증) |
| ✅ **T023** [P] | `FloatingQaCards` — 질문 카드 → 연결선 → 답변 카드(정적 DOM) | FR-033 | **9, 10.4** | `src/components/hero/FloatingQaCards.tsx` | 실제 질문 데이터를 렌더하지 않는다 |
| ✅ **T024** [P] | `FlowSteps` 3단계 + 전환 밴드(88/48px) + 마무리 CTA + Footer | FR-033 | **9, 4** | `src/components/hero/FlowSteps.tsx`, `HomePage.tsx` | 효과를 전부 끄고도 3단계가 동일하게 읽힌다(FR-035) |
| ✅ **T025** | `data/types.ts` + `data/validation.ts` — 길이·공백 규칙 **단일 출처** | **FR-023~027** | 12 | `src/data/types.ts`, `src/data/validation.ts` | 경계값 15케이스(0·1·최대·최대+1·공백만 × 3필드) 통과 |
| ✅ **T026** | `data/repository.ts` 인터페이스 + 오류 계약 6종 | contracts/repository.md | — | `src/data/repository.ts` | 계약 테스트 7항목이 인터페이스로 표현된다 |
| ✅ **T027** | `mockRepository` + `fixtures.ts` — 권한 규칙·지연·오류 재현 | FR-007·008·012·017·018 | — | `src/data/mockRepository.ts`, `fixtures.ts` | `contracts/repository.md` 동치 조건 7항목 통과 |
| ✅ **T028** | Mock 세션 — `?as=guest\|member\|admin`, `&fail=1`, `&empty=1` (**Mock 모드 전용**) | plan.md 15절 | — | `src/auth/AuthProvider.tsx` | Supabase 모드에서 질의가 무시된다 |
| ✅ **T029** | 라우터 7개 + `RequireAuth`(리다이렉트 아닌 **안내 렌더**) | FR-020, US3-4 | **5, 2.1** | `src/App.tsx`, `src/auth/RequireAuth.tsx` | 비회원이 `/questions` 접근 시 로그인 안내가 보인다 |
| ✅ **T030** | 질문 리스트 — `QuestionRow`(데스크톱) / `QuestionCard`(모바일), 대기 행 좌측 강조선 | FR-007·008, SC-003·004 | **11.2, 11.3** | `src/components/question/{QuestionRow,QuestionCard}.tsx`, `pages/QuestionListPage.tsx` | 관리자에 작성자 열/행 표시. 모바일 순서는 상태→제목 |
| ✅ **T031** | 리스트 상태 4종(Loading·Empty·Error·LoginRequired) 연결 | FR-029·FR-032 | **14** | `pages/QuestionListPage.tsx` | `&fail=1`·`&empty=1`로 실제 확인 |
| ✅ **T032** | `StatusTabs` 상태 필터(전체·대기·완료) + 비ok 상태에서 건수 숨김·비활성 | **FR-041** | **11.1** | `src/components/ui/StatusTabs.tsx`, `pages/QuestionListPage.tsx` | 빈 목록·오류에서 건수가 사라지고 탭이 비활성. 관리자 기본값 `답변 대기` |
| ✅ **T033** | 질문 페이지 4상태 — 작성·상세·수정·답변. `QuestionForm`·`AnswerForm`·`QuestionBody`·`AnswerBlock` | FR-005·009·010·014·015 | **12, 13** | `src/components/question/*.tsx`, `pages/Question*Page.tsx` | 역할·답변 유무 6조합에서 버튼 구성이 13.1절 표와 일치 |
| ✅ **T034** | `DeleteConfirm` 인라인 확인 + 답변 후 잠금 안내 | **FR-011·FR-012** | **13.1** | `src/components/question/DeleteConfirm.tsx` | 확인 없이 삭제 불가. 답변 후 수정·삭제 버튼 **부재** |

### 🚦 게이트 G1 — Phase 4 진입 전 필수

| ID | 검증 | 근거 |
|---|---|---|
| **G1-a** | 1440·390 두 폭에서 회원·관리자 핵심 시나리오 E2E 통과, 390px 가로 스크롤 0 | SC-007, FR-037 |
| **G1-b** | 세 화면 axe 위반 0건, 키보드만으로 주요 행동 8종 완료 | SC-008, 원칙 VIII |
| **G1-c** | `npm run contrast` 통과, 회색조 스냅샷에서 상태 구분 | SC-009, 원칙 VI·IX |
| **G1-d** | `reducedMotion:'reduce'`에서 5종 정지 스크린샷 확보 | FR-038 |
| **G1-e** | design.md 24절 A~H 체크리스트 자체 점검 기록 | 원칙 XIII |

---

## Phase 4. Claude Design 동기화와 UI 수정 (T035–T040)

> **선행**: G1 통과. **후행**: G2 통과 전 Phase 5 착수 금지.

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| **T035** | `/design-sync` 대상 **design-system 타입 프로젝트 신규 생성**(`QANOW Design System`) | plan.md 16절 | — | — | `get_project`가 `PROJECT_TYPE_DESIGN_SYSTEM`을 반환. **기존 시안 프로젝트는 타입 변경 불가이므로 재사용하지 않는다** |
| **T036** | 동기화 전 코드 구조 검사 — 컴포넌트가 페이지 로직·Supabase 코드에 의존하지 않는지 | 원칙 XI | 19 | `src/components/**` | `components/`에서 `pages/`·`data/supabase*` import 0건(lint 규칙으로 강제) |
| **T037** | `ds-bundle/` 미리보기 HTML 생성 — 7그룹, 각 파일 첫 줄 `<!-- @dsCard group="…" -->` | plan.md 16절 | 19, 15, 16 | `ds-bundle/**`, `scripts/build-ds.ts` | 그룹 7개(Foundations·Actions·Forms·Status·Navigation·Question·Hero)가 모두 생성 |
| **T038** | `finalize_plan` → `write_files`로 **컴포넌트 단위 업로드**(일괄 교체 금지) | plan.md 16절 | — | — | Design System 패널에 카드가 그룹별로 보인다 |
| **T039** | 승인된 확정 시안(`QANOW 프로토타입.dc.html`)과 구현 비교 → CRITICAL·HIGH 수정 | FR-039, 원칙 V | **24 A~H** | 해당 컴포넌트 | 차이 표를 남기고 CRITICAL·HIGH 0건 |
| **T040** | 시각 회귀 기준선 생성(1440·390·reduced-motion·회색조) | 원칙 V·IX | 20, 22 | `tests/e2e/__screenshots__/` | 이후 변경 시 회귀가 검출된다 |

### 🚦 게이트 G2 — Supabase 착수 전 필수
`/design-sync` 완료 + T039 CRITICAL·HIGH 0건 + T040 기준선 확보.

---

## Phase 5. Supabase 기반 (T041–T048)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| **T041** | Supabase 클라이언트 + `VITE_DATA_SOURCE` 분기 | plan.md 15절 | — | `src/lib/supabase.ts`, `src/data/repository.ts` | `mock`/`supabase` 전환이 코드 수정 없이 된다 |
| **T042** | `0001_schema.sql` — `profiles`·`questions`·`answers` + **CHECK** + 인덱스 + `unique(question_id)` | FR-016·023~025·027 | — | `supabase/migrations/0001_schema.sql` | 공백만 INSERT가 DB에서 거부된다. 답변 2건 INSERT가 거부된다 |
| **T043** | `0003_profile_trigger.sql` — `auth.users` → `profiles(role='member')` | FR-001·FR-004 | — | `supabase/migrations/0003_profile_trigger.sql` | 가입 시 프로필이 자동 생성되고 역할이 `member` |
| **T044** | `is_admin()` — `SECURITY DEFINER`, `search_path=public` | research R5 | — | `supabase/migrations/0002_rls.sql` | 정책 평가 시 재귀가 발생하지 않는다 |
| **T045** | RLS 정책 12개 작성 | **FR-018~022**, contracts/rls.md | — | `supabase/migrations/0002_rls.sql` | `tests/rls/` 12행 전부 통과 |
| **T046** | **`GRANT` 명시** + `ENABLE ROW LEVEL SECURITY` 3테이블 | 원칙 II | — | `supabase/migrations/0002_rls.sql` | GRANT를 빼면 배포 환경에서 실패함을 확인(로컬 기본 권한에 기대지 않는다) |
| **T047** | `supabaseRepository` 구현 — 목록은 임베딩 `answers(id)` 1회 조회, `toQuestionSummary()` 상태 도출 | FR-006·007·008 | 11 | `src/data/supabaseRepository.ts` | `contracts/repository.md` 동치 조건 7항목을 Mock과 **동일하게** 통과 |
| **T048** | 관리자 역할 판별 — 세션 후 `profiles.role` 1회 조회, Context 보관 | FR-004, research R4 | 6 | `src/auth/AuthProvider.tsx` | 클라이언트 역할을 조작해도 RLS가 거부한다 |

---

## Phase 6. 회원 기능 (T049–T056)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| **T049** | 회원가입 — **이메일·비밀번호만**. 중복 이메일 거부 문구 | FR-001 | 2(문구) | `src/pages/SignupPage.tsx` | 중복 가입 시 필드 오류. 닉네임 필드 없음(FR-040) |
| **T050** | 로그인·로그아웃 + 세션 유지 | FR-002 | 7 | `src/pages/LoginPage.tsx`, `AuthProvider.tsx` | 새로고침 후에도 로그인 유지 |
| **T051** | 로그인 실패 문구 — 이메일/비밀번호 **구분하지 않음** | **FR-003** | 2 | `src/pages/LoginPage.tsx` | 두 실패 경우의 문구가 동일 |
| **T052** | 내 질문 목록(본인 것만, 최신순) | FR-007 | 3.2, 11 | `src/pages/QuestionListPage.tsx` | 다른 회원 질문이 0건 |
| **T053** | 질문 작성 — 검증·저장 중·중복 제출 차단 | FR-005·026·031 | 12 | `src/pages/QuestionNewPage.tsx` | 저장 중 재클릭해도 1건만 생성 |
| **T054** | 질문 수정(답변 전만) | FR-010·FR-012 | 12, 13.1 | `src/pages/QuestionEditPage.tsx` | 답변 후 수정 요청이 RLS에서 거부 |
| **T055** | 질문 삭제(확인 단계 + 답변 전만) | FR-011·FR-012·FR-013 | 13.1 | `DeleteConfirm.tsx`, `supabaseRepository.ts` | 삭제 후 상세 접근 불가. 답변도 함께 삭제 |
| **T056** | 답변 확인 — 상태 전환 표시 | FR-006, SC-004·SC-010 | 13 | `src/pages/QuestionDetailPage.tsx` | 답변 등록 후 새로고침 없이 `답변 완료`로 바뀐다 |

---

## Phase 7. 관리자 기능 (T057–T061)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| **T057** | 전체 질문 목록 + 작성자 이메일 열 | FR-008 | 6, 11.2 | `src/pages/QuestionListPage.tsx` | 관리자만 작성자 열이 보인다 |
| **T058** | 관리자 진입 시 기본 필터 `답변 대기` | **FR-041**, SC-003 | 11.1 | `StatusTabs.tsx` | Phase 3에서 선반영됨. Supabase 연결 후 재확인 |
| **T059** | 답변 작성 → 상태 `답변 완료` 전환 | FR-014 | 13.1 | `AnswerForm.tsx` | 답변 INSERT 후 목록 상태가 바뀐다 |
| **T060** | 답변 수정(상태 유지), 질문당 1개 유지 | FR-015·FR-016 | 13.1 | `AnswerForm.tsx` | 두 번째 답변 INSERT가 `unique` 위반으로 거부 |
| **T061** | 권한 검증 — 회원의 답변 작성·수정 거부, 관리자 질문 작성 거부 | **FR-017, FR-005** | 6 | `supabase/migrations/0002_rls.sql`, `tests/rls/` | 직접 호출로 거부 확인(UI 경유 아님) |

---

## Phase 8. 테스트와 최종 검증 (T062–T070)

| ID | 태스크 | 요구사항 | design.md | 파일 | 검증 |
|---|---|---|---|---|---|
| **T062** | 검증 경계값 단위 테스트 15케이스 | FR-023~025, **SC-006** | 12 | `tests/unit/validation.test.ts` | 100% 통과 |
| **T063** | RLS 계약 테스트 12행 — 익명·회원A·회원B·관리자 4클라이언트, **직접 호출** | FR-018~022, **SC-005**, 원칙 II | — | `tests/rls/*.test.ts` | 거부율 100% |
| **T064** | 역할별 UI 존재·부재 컴포넌트 테스트 | FR-012·FR-017 | 6, 13.1 | `tests/component/*.test.tsx` | 회원 화면에 답변 입력 요소가 **존재하지 않음** |
| **T065** | E2E 1440·390 핵심 시나리오 | **SC-007** | 20 | `tests/e2e/scenarios.spec.ts` | 두 폭 100% 완주, 가로 스크롤 0 |
| **T066** | 키보드 전용 E2E — 주요 행동 8종 | **SC-008** | 21 | `tests/e2e/keyboard.spec.ts` | 마우스 없이 8종 완료 |
| **T067** | 접근성·대비 — axe 0건 + `npm run contrast` + 회색조 스냅샷 | **SC-009**, 원칙 VI·IX | 17, 21 | `tests/a11y/*` | 전 항목 통과. **육안 판단을 근거로 쓰지 않는다** |
| **T068** | 모션 감소 검증 — 5종 정지 + 정보 손실 없음 | **FR-038** | 22 | `tests/e2e/motion.spec.ts` | 감소 상태에서도 로딩·저장 중을 텍스트로 알 수 있다 |
| **T069** | design.md 24절 A~H 최종 점검 기록 | 원칙 XIII | **24** | `specs/001-qanow-qa-board/verification.md` | 40여 항목 통과/실패를 기록 |
| **T070** | **배포 환경에서 실제 확인** — 환경 변수 빈 문자열, GRANT 누락, 테스트 도메인 가입 3종 | 원칙 XIII, research R8·R9 | — | — | 원격에 올려 실제로 돌려보기 전에는 "된다"고 말하지 않는다 |

---

## 차단·의존 요약

| 항목 | 차단되는 태스크 | 해소 조건 |
|---|---|---|
| ~~`FR-041` 미승인~~ | ~~T032, T058~~ | ✅ 2026-08-29 spec.md에 FR-041 추가 |
| ~~SC-001~004 측정 방법~~ | ~~T069 일부~~ | ✅ 2026-08-29 수업 시연 관찰로 확정 |
| design-system 프로젝트 미생성 | T038 | T035 완료 |
| 게이트 G1 | Phase 4 전체 | G1-a~e 통과 |
| 게이트 G2 | Phase 5~8 전체 | T039 CRITICAL·HIGH 0건 + T040 기준선 |

## 커밋 단위

헌장에 따라 **사용자 스토리 단위**로 묶는다. 태스크마다 쪼개지 않는다.

| 커밋 | 포함 태스크 | 대응 |
|---|---|---|
| 1 | T001~T008 | 프로젝트 설정 |
| 2 | T009~T020 | 디자인 시스템 |
| 3 | T021~T024 | US5 메인 페이지 |
| 4 | T025~T031, T033~T034 | US1·US4 Mock 화면 |
| 5 | T035~T040 | 디자인 동기화 |
| 6 | T041~T048 | 데이터 계층 |
| 7 | T049~T056 | US1 회원 기능 |
| 8 | T057~T061 | US2 관리자 기능 |
| 9 | T062~T070 | US3 권한 검증과 최종 |
