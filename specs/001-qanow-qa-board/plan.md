# Implementation Plan: QANOW 질의응답 게시판

**Branch**: `001-qanow-qa-board` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-qanow-qa-board/spec.md`

**함께 읽은 문서**: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (v1.0.0),
[`spec.md`](./spec.md) (FR-001~FR-040, SC-001~SC-011), [`design-brief.md`](./design-brief.md),
[`design.md`](./design.md) (확정 화면 설계)

## Summary

회원이 비공개로 질문을 남기고 관리자가 답변하는 1:1 질의응답 게시판을 **별도 백엔드 서버 없이**
React + Vite + TypeScript 단일 프론트엔드와 Supabase(Auth · PostgreSQL · RLS)로 구현한다.

핵심 접근:

1. **권한은 RLS가 최종 강제한다.** 백엔드 서버가 없으므로 헌장 원칙 II의 "데이터 계층"은 곧 Postgres의
   Row Level Security이다. UI 분기는 보조 수단이며 보안 근거가 되지 않는다.
2. **Mock 우선.** 저장소 접근을 `QuestionRepository` 인터페이스 하나로 좁히고 `mock` / `supabase` 두
   구현을 둔다. 세 핵심 화면을 Mock으로 먼저 완성·검증한 뒤 Supabase를 연결한다.
3. **디자인은 design.md가 단일 출처.** 토큰·간격·타이포·상태 문구를 CSS 변수와 공통 컴포넌트로 1:1
   옮기고, 화면·기능을 추가하지 않는다.
4. **순서 고정**: UI(Mock) → 시각 검증 → `/design-sync` → Supabase 연결 → 권한·검증 통합 테스트.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node 20+

**Primary Dependencies**: React 19, Vite 6, React Router 7, `@supabase/supabase-js` 2.x.
스타일은 **순수 CSS + CSS 변수**(CSS Modules). UI 프레임워크·CSS-in-JS·상태관리 라이브러리를 도입하지
않는다(헌장 원칙 XI).

**Storage**: Supabase PostgreSQL. 테이블 3개(`profiles`, `questions`, `answers`) + RLS.

**Testing**: Vitest(단위·컴포넌트) + Testing Library, Playwright(E2E, 1440/390 두 프로젝트),
`@axe-core/playwright`(접근성), Vitest 별도 프로젝트로 RLS 계약 테스트.

**Target Platform**: 최신 브라우저(데스크톱·모바일 웹). 정적 배포(SPA).

**Project Type**: 단일 프론트엔드 웹 애플리케이션 + 관리형 백엔드(BaaS). 별도 서버 코드 없음.

**Performance Goals**: 메인 Hero 시각 효과 자산 합계 **≤ 100KB**(이미지·동영상·Lottie 금지, CSS만),
웹폰트 전송량 **≤ 150KB**, 메인 문구·CTA가 배경 효과보다 먼저 표시(헌장 원칙 VI, design.md 10절).

**Constraints**:
- 로컬 기동은 설치 1명령 + 실행 1명령. 포트 **5174**(Mock) / **5175**(Supabase). 3777~3779 사용 금지.
- 비밀값·`.env.local` 커밋 금지. 필수 환경 변수는 **존재 + 비어 있지 않음**을 기동 시 함께 검사한다.
- 데스크톱 1440px / 모바일 390px 두 폭에서 핵심 시나리오 완주(SC-007).
- WCAG 2.2 AA. 대비는 계산해 기록한다(육안 판단 금지).

**Scale/Scope**: 화면 3개(+ 인증 2개) · 엔터티 3개 · 라우트 7개 · 공통 컴포넌트 약 12개.
검색·페이지네이션이 범위 밖이므로 한 화면에서 훑을 수 있는 데이터 규모를 가정한다.

## Constitution Check

*GATE: Phase 0 이전 통과 필수. Phase 1 설계 후 재확인.*

| 원칙 | 게이트 | 판정 | 이 계획에서의 충족 방법 |
|---|---|---|---|
| I. 역할 분리 | 역할 × 행위 권한 표가 있고 모든 FR이 대응하는가 | ✅ | design.md 6절 표 + 아래 11절 역할 모델. 금지 행위마다 RLS 거부 테스트 |
| II. 데이터 계층 권한 강제 | 각 접근 경로의 강제 계층이 기록되었는가 | ✅ | 12절 RLS 정책 표에 경로별 정책 명시. UI를 거치지 않는 직접 호출 테스트 필수 |
| III. 입력 검증 | 규칙이 한 곳에 정의되고 경계값 테스트가 있는가 | ✅ | `src/data/validation.ts` 단일 출처 + DB `CHECK` 제약이 최종 강제(13절) |
| IV. 명세 준수 | 스펙 밖 기능이 없는가 | ✅ | `FR-041` 추가(2026-08-29)로 상태 필터의 근거가 생겼다 |
| V. 세 화면 일관성 | 공용 레이아웃·토큰을 세 화면이 공유하는가 | ✅ | Header/Page/Button/Input/Badge/StateBox 공통 컴포넌트 1벌(4절) |
| VI. 시각 효과 한도 | 성능 예산이 수치로 있는가, 대비를 계산했는가 | ✅ | 위 Performance Goals에 수치 확정. 대비 표는 design.md 17절, CI에서 재계산 |
| VII. 모션 감소 | 모든 애니메이션에 감소 대응이 짝으로 있는가 | ✅ | `motion.css` 한 파일에만 `@keyframes` 사용처를 두고 전부 미디어 쿼리 안에 넣음(7절) |
| VIII. 키보드 조작 | 주요 행동 8종을 키보드로 완료하는가 | ✅ | 모든 조작 요소가 `<button>`/`<a>`/`<input>`. 키보드 전용 E2E(14절) |
| IX. 색상 외 상태 표현 | 모든 상태에 텍스트가 있는가 | ✅ | `Badge`는 `children` 필수. 회색조 스크린샷 테스트(14절) |
| X. 데스크톱·모바일 | 기준 폭이 명시되고 두 폭에서 E2E가 도는가 | ✅ | 1440 / 390. Playwright 2 프로젝트 |
| XI. 단순 MVP | 추가 계층이 정당화되었는가 | ⚠️ | **Repository 추상화 1겹 추가.** Complexity Tracking 2번 |
| XII. 추적성 | 모든 태스크가 FR/US와 디자인 근거를 인용하는가 | ✅ | `/speckit-tasks`에서 각 태스크에 FR + design.md 절 번호를 병기 |
| XIII. 실패는 완료가 아님 | 완료 전 전체 테스트·빌드를 돌리는가 | ✅ | 17절 명령 + 커밋 전 `npm run verify`. `--no-verify` 금지 |

**게이트 결과**: 원칙 IV·XI 두 건이 정당화 대상이며 Complexity Tracking에 기록했다. 나머지는 통과.

## Project Structure

### Documentation (this feature)

```text
specs/001-qanow-qa-board/
├── spec.md              # 기능 명세 (완료)
├── design-brief.md      # 디자인 지시서 (완료)
├── design.md            # 화면 설계 확정서 (완료)
├── plan.md              # 이 파일
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── repository.md    # 저장소 인터페이스 계약
│   └── rls.md           # RLS 권한 계약(테스트 대상 표)
├── checklists/
│   └── requirements.md  # 명세 품질 체크리스트 (완료)
└── tasks.md             # /speckit-tasks 산출물 (아직 없음)
```

### Source Code (repository root)

```text
src/
├── main.tsx                       # 진입점. env 검증 후 렌더
├── App.tsx                        # 라우터 정의
├── styles/
│   ├── tokens.css                 # design.md 15절 토큰 전부 (:root)
│   ├── base.css                   # reset, body, a/a:hover, focus-visible 기본
│   └── motion.css                 # @keyframes + prefers-reduced-motion 게이트
├── components/
│   ├── layout/
│   │   ├── Header.tsx / .module.css
│   │   ├── Footer.tsx / .module.css
│   │   ├── Page.tsx               # 최대 폭·여백 컨테이너
│   │   └── PageHeader.tsx         # design.md 8절
│   ├── ui/
│   │   ├── Button.tsx             # 5종 variant
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Field.tsx              # 라벨+도움말+글자수+오류 묶음
│   │   ├── Badge.tsx              # 7종
│   │   ├── StateBox.tsx           # Loading/Empty/Error/Unauthorized/LoginRequired
│   │   ├── Skeleton.tsx
│   │   └── StatusTabs.tsx
│   ├── question/
│   │   ├── QuestionRow.tsx        # 데스크톱 목록 행
│   │   ├── QuestionCard.tsx       # 모바일 목록 카드
│   │   ├── QuestionBody.tsx       # 질문 블록(좌측 중립 획)
│   │   ├── AnswerBlock.tsx        # 답변 블록(좌측 파란 획) + 대기 안내
│   │   ├── QuestionForm.tsx       # 작성·수정 공용
│   │   ├── AnswerForm.tsx
│   │   └── DeleteConfirm.tsx      # 인라인 삭제 확인
│   └── hero/
│       ├── Hero.tsx
│       ├── AuroraBackdrop.tsx     # Aurora + Grid + Scrim 3겹
│       ├── FloatingQaCards.tsx
│       └── FlowSteps.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── QuestionListPage.tsx
│   ├── QuestionNewPage.tsx
│   ├── QuestionDetailPage.tsx
│   ├── QuestionEditPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── NotFoundPage.tsx
├── auth/
│   ├── AuthProvider.tsx           # 세션 + 역할 컨텍스트
│   ├── useAuth.ts
│   └── RequireAuth.tsx            # 라우트 가드(UI 편의, 보안 근거 아님)
├── data/
│   ├── types.ts                   # Question, Answer, Profile, QuestionStatus
│   ├── validation.ts              # 길이·공백 규칙 단일 출처
│   ├── repository.ts              # 인터페이스 + 팩토리
│   ├── mockRepository.ts
│   ├── supabaseRepository.ts
│   └── fixtures.ts                # Mock 데이터(테스트와 공용)
├── lib/
│   ├── env.ts                     # 빈 문자열까지 검사
│   ├── supabase.ts
│   └── format.ts                  # 날짜 표기
└── test/setup.ts

supabase/
├── migrations/
│   ├── 0001_schema.sql            # 테이블 + CHECK + 인덱스
│   ├── 0002_rls.sql               # 정책 + GRANT
│   └── 0003_profile_trigger.sql   # auth.users → profiles
└── seed.sql

tests/
├── unit/                          # validation 경계값
├── component/                     # Badge/StateBox/역할별 버튼 존재·부재
├── rls/                           # 권한 계약(직접 호출)
├── a11y/                          # axe + 대비 계산
└── e2e/                           # 1440 / 390 시나리오, 키보드 전용
```

**Structure Decision**: 단일 Vite 프로젝트 하나. 백엔드 서버가 없으므로 `frontend/`·`backend/` 분리를
두지 않는다. `supabase/`는 소스가 아니라 **선언적 마이그레이션**이며 애플리케이션 코드가 아니다.
`components/`를 `layout` · `ui` · `question` · `hero` 네 갈래로만 나눈다(더 잘게 쪼개지 않는다).

---

# 구현 설계

## 1. 전체 디렉터리 구조

위 **Source Code** 트리가 확정 구조이다. 규칙:

- 페이지는 `pages/`에만, 재사용 요소는 `components/`에만 둔다. 페이지 안에 레이아웃 CSS를 직접 쓰지 않는다.
- 컴포넌트는 `X.tsx` + `X.module.css` 짝으로 둔다. 전역 CSS는 `styles/` 세 파일뿐이다.
- 데이터 접근은 **`data/repository.ts`를 통해서만** 한다. 페이지가 `supabase-js`를 직접 부르지 않는다.
- 검증 규칙은 `data/validation.ts` 외에 어디에도 중복 정의하지 않는다(원칙 III).
- 테스트는 종류별 디렉터리로 나눠 실행 대상을 분리한다.

## 2. 페이지와 공통 컴포넌트 구조

### 2.1 라우트 (design.md 5절)

| 경로 | 페이지 | 접근 | 근거 |
|---|---|---|---|
| `/` | HomePage | 전체 | FR-033·FR-034 |
| `/login` | LoginPage | 비로그인 | FR-002 |
| `/signup` | SignupPage | 비로그인 | FR-001 |
| `/questions` | QuestionListPage | 로그인 | FR-007·FR-008·FR-020 |
| `/questions/new` | QuestionNewPage | 회원 | FR-005 |
| `/questions/:id` | QuestionDetailPage | 작성자·관리자 | FR-009·FR-021 |
| `/questions/:id/edit` | QuestionEditPage | 작성자, 답변 전 | FR-010·FR-012 |
| `*` | NotFoundPage | 전체 | — |

> 작성·상세·수정을 **별도 주소로 분리**한다. `/speckit-clarify` Q1이 미답변이나, spec.md의 권한 시나리오가
> "타인의 질문 상세 주소로 직접 접근하면 거부된다"를 인수 조건으로 삼고 있어(US3-1) 상세가 고유 주소를
> 가져야 시험이 성립한다. design.md 25절 미결 5번을 이 결정으로 닫는다.

`RequireAuth`는 세션·역할을 확인해 미인증이면 `<StateBox variant="loginRequired">`를 렌더한다.
**리다이렉트하지 않는다** — design.md 14절이 "목록 자리에 로그인 안내를 표시"로 확정했기 때문이다.
이 가드는 UX 편의이며, 실제 차단은 RLS가 한다(원칙 II).

### 2.2 공통 컴포넌트 목록 (12개, 그 이상 만들지 않는다)

`Header` · `Footer` · `Page` · `PageHeader` · `Button` · `Input` · `Textarea` · `Field` · `Badge` ·
`StateBox` · `Skeleton` · `StatusTabs`
질문 도메인 전용: `QuestionRow` · `QuestionCard` · `QuestionBody` · `AnswerBlock` · `QuestionForm` ·
`AnswerForm` · `DeleteConfirm`
Hero 전용: `Hero` · `AuroraBackdrop` · `FloatingQaCards` · `FlowSteps`

## 3. 디자인 토큰을 CSS 변수로 구현하는 방법

`src/styles/tokens.css`에 design.md 15절 값을 **이름과 값 그대로** 옮긴다.

```css
:root{
  --sans:"Gothic A1","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,monospace;

  --ink900:#080D1C; --ink700:#18213F;
  --onDark:#F2F5FC; --onDark2:#C7CFE4; --onDark3:#96A0BC;

  --canvas:#F5F7FB; --sur:#FFFFFF; --fg:#111827; --fg2:#48526B;
  --divider:#DFE4EE; --inputBorder:#767F94;

  --pri:#2A4FE0; --pri2:#1E3BB8; --vio:#6B46E5;
  --focus:#2A4FE0;        /* 밝은 표면 */
  --focusDark:#7C97FF;    /* 어두운 표면 — design.md 25절 2번 해소 */
  --err:#A81E12; --waitEdge:#C97A16;

  /* 간격 (design.md 18절) */
  --sp1:4px; --sp2:8px; --sp3:12px; --sp4:16px; --sp5:20px; --sp6:24px;
  --sp7:32px; --sp8:40px; --sp9:56px; --sp10:72px; --sp11:96px;

  /* 최대 폭 */
  --wHero:1200px; --wSection:1120px; --wPage:960px; --wProse:720px;

  /* 반경 */
  --r-btn:8px; --r-card:12px; --r-badge:6px;
}
```

규칙:

- **하드코딩 색을 금지한다.** `stylelint` 규칙 `declaration-property-value-disallowed-list`로 색상
  프로퍼티에 `#`, `rgb(`를 막고 `var(--…)`만 허용한다(예외: `rgba(255,255,255,.NN)` 다크 표면 경계와
  Aurora 그라데이션 3색은 `AuroraBackdrop.module.css`에만 허용).
- `--ink800`은 확정본 미사용이므로 **선언하지 않는다**(design.md 25절 3번).
- 다크/라이트 전환은 테마 토글이 아니라 **영역별 클래스**(`.surfaceDark`)로 처리한다. `data-theme`을
  도입하지 않는다(원칙 XI).
- 대비 계산 스크립트 `scripts/contrast.ts`가 `tokens.css`를 읽어 design.md 17절 표를 재생성하고,
  기준 미달이 있으면 종료 코드 1을 반환한다. `npm run verify`에 포함한다(원칙 VI).

## 4. Header · Button · Input · Textarea · Badge · QuestionCard 구조

### Header (design.md 7절)
```
Header({ current: 'home' | 'list' })
  └ role/session 은 useAuth()에서 읽는다
```
- 항목 3개 고정: 워드마크 · `서비스 소개` · `내 질문`/`문의 관리`(역할별) + 역할 배지.
- **햄버거 메뉴를 만들지 않는다.** 모바일에서도 그대로 노출한다.
- 배경 `--ink900` 고정. 내부 포커스 링은 `--focusDark`.

### Button
```ts
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'destructive' | 'darkPrimary' | 'darkSecondary';
  size?: 'md' | 'sm';        // 44/48px, 38px
  loading?: boolean;         // disabled + 라벨 교체
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```
- variant 5종 외에 추가하지 않는다. `loading`이 true면 `disabled`와 라벨 교체를 **한 곳에서** 처리해
  중복 제출을 막는다(FR-031).
- `:focus-visible` → `outline:2px solid var(--focus); outline-offset:2px`. 다크 영역은 `--focusDark`.

### Input / Textarea / Field
```tsx
<Field label="제목" help="100자 이내로 입력해 주세요." error={err} count={{now, max:100}}>
  <Input ... />
</Field>
```
- `Field`가 라벨·`aria-describedby`·오류(`aria-invalid`)·글자 수를 한 번에 묶는다. 라벨을 생략할 수 없다.
- Textarea 최소 높이 240px(모바일 180px), 글자 16px 고정.

### Badge
```ts
type BadgeProps = {
  tone: 'wait' | 'done' | 'error' | 'neutral' | 'saving';
  surface?: 'light' | 'dark';
  children: React.ReactNode;   // 필수 — 텍스트 없는 배지를 만들 수 없다 (FR-030)
};
```

### QuestionRow / QuestionCard
- 같은 데이터(`QuestionSummary`)를 받고 **폭에 따라 어느 쪽을 렌더할지 CSS로 결정**한다
  (`@media (max-width:767px)`에서 Row 숨김, Card 표시). 자바스크립트로 화면 폭을 재지 않는다.
- Row: 격자 `1fr 132px 108px`(관리자 `1fr 190px 132px 108px`), 최소 높이 58px, 제목 2줄 말줄임,
  대기 행 좌측 3px `--waitEdge`.
- Card: `상태 배지 → 제목 → (관리자) 작성자 → 작성 일시` 순서.
- 둘 다 전체가 `<button>`이며 클릭 시 `/questions/:id`로 이동한다.

## 5. 메인 Hero와 Aurora / Grid / Floating Card 구현 방법

`AuroraBackdrop`이 **세 겹을 한 컴포넌트로** 캡슐화한다. 값은 design.md 10절 그대로이다.

```
<section class="hero surfaceDark">
  <AuroraBackdrop />        {/* z0 aurora · z1 grid · z2 scrim */}
  <div class="heroInner">   {/* z3 */}
    좌: eyebrow / h1 / lead / CTA 2 / note
    우: <FloatingQaCards />
  </div>
</section>
<div class="fadeBand" />    {/* 88px / 모바일 48px */}
```

- Aurora는 `radial-gradient` 3개 + `filter: blur(6px)`. **이미지·동영상·Lottie·SVG 파일을 쓰지 않는다.**
- Grid는 `repeating` 대신 `linear-gradient` 2개 + `background-size:44px 44px`, `opacity:.06`,
  `mask-image: radial-gradient(70% 60% at 50% 40%, #000 30%, transparent 100%)`.
- **Scrim 레이어를 제거하지 않는다.** 이 레이어가 헤드라인 17.74:1을 보장한다. 컴포넌트에 주석으로 명시하고
  a11y 테스트가 존재를 확인한다.
- `FloatingQaCards`는 정적 DOM이다. 질문 카드 → 연결선(높이 64px, 2px 세로선 + 8px 점 + `관리자 확인`
  레이블) → 답변 카드(좌측 여백 40px). **실제 질문 데이터를 렌더하지 않는다.**
- 애니메이션 클래스(`.drift` `.floaty1` `.floaty2`)는 `motion.css`에서만 정의한다(7절).

## 6. 데스크톱과 모바일 반응형

- **브레이크포인트 2개**: `768px`(모바일↔태블릿 이상), `1024px`(데스크톱 레이아웃). 그 이상 만들지 않는다.
- 기준 검증 폭은 **1440px**와 **390px**이다(design.md 20절).
- 접근 방식은 **모바일 우선**이 아니라 **디자인 확정본 우선**이다. design.md 20절 표의 각 행을 미디어 쿼리
  하나로 옮긴다. 표에 없는 중간 상태를 발명하지 않는다.
- 목록은 CSS로 Row↔Card를 전환하고, 폼 행동 줄은 모바일에서 `flex-direction: column-reverse`로 뒤집는다.
- 긴 제목 2줄 말줄임(`-webkit-line-clamp:2`), 긴 이메일 1줄 말줄임. **가로 스크롤이 생기면 실패로 본다.**
- E2E가 두 폭에서 각각 돌며, 390px에서 `document.documentElement.scrollWidth <= 390`을 단언한다.

## 7. prefers-reduced-motion 처리

**모든 `@keyframes` 사용처를 `src/styles/motion.css` 한 파일에만 둔다.**

```css
/* motion.css — 이 파일 밖에서 animation 프로퍼티를 쓰지 않는다 */
@media (prefers-reduced-motion: no-preference){
  .drift   { animation: drift 22s ease-in-out infinite alternate; }
  .floaty1 { animation: floaty 11s ease-in-out infinite alternate; }
  .floaty2 { animation: floaty 13s ease-in-out infinite alternate-reverse; }
  .spin    { animation: sp 1s linear infinite; }
  .pulse   { animation: pulse 1.6s ease-in-out infinite; }
}
@keyframes drift  { from{transform:translate3d(0,0,0)}  to{transform:translate3d(-1.4%,1.6%,0)} }
@keyframes floaty { from{transform:translateY(0)}       to{transform:translateY(-7px)} }
@keyframes sp     { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.55} }
```

- 강제 장치: `stylelint`에 `declaration-property-value-disallowed-list: { animation: [/.*/], "animation-name": [/.*/] }`를
  걸고 `motion.css`만 예외 처리한다. 다른 파일에 애니메이션이 생기면 **린트가 실패한다**(원칙 VII).
- 정보가 모션에만 담기지 않는다: 로딩은 `불러오는 중입니다.` 텍스트가, 저장 중은 버튼 라벨이 알린다.
- 진입 애니메이션·스크롤 트리거를 추가하지 않는다.
- Playwright에 `reducedMotion: 'reduce'` 프로젝트를 두어 세 화면 스크린샷을 남긴다.

## 8. Loading · Empty · Error · Unauthorized 상태

화면 상태를 **판별 유니온 하나**로 다룬다. `boolean` 플래그를 여러 개 두지 않는다.

```ts
type ViewState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; retry: () => void }
  | { kind: 'unauthorized' }        // FR-021
  | { kind: 'loginRequired' }       // FR-020
  | { kind: 'empty' }
  | { kind: 'ready'; data: T };
```

- `StateBox`가 `loading | empty | error | unauthorized | loginRequired` 다섯 변형을 렌더하며
  **문구는 design.md 14절 표를 그대로 상수로 둔다**(`src/components/ui/stateCopy.ts`).
- 저장 중은 별도 상태가 아니라 `Button`의 `loading` prop이다(질문 페이지 전용).
- 리스트가 `loading | empty | error`일 때 `StatusTabs`는 **건수를 숨기고 비활성화**한다(design.md 11.1절).
- 오류 문구에 예외 메시지를 넣지 않는다(FR-032). `console.error`로만 남긴다.
- 로딩 스켈레톤 행 높이 **58px 고정** — 실제 행과 같아야 레이아웃이 튀지 않는다.

## 9. 인증 상태 관리

```tsx
// AuthProvider.tsx
type AuthState =
  | { status: 'loading' }
  | { status: 'anon' }
  | { status: 'authed'; userId: string; email: string; role: 'member' | 'admin' };
```

- `supabase.auth.getSession()` 1회 + `onAuthStateChange` 구독. 상태 라이브러리를 도입하지 않고
  **React Context 하나**로 끝낸다(원칙 XI).
- **역할은 세션이 아니라 `profiles.role`에서 읽는다.** 세션이 생기면 `profiles`를 1회 조회해 역할을
  확정하고 컨텍스트에 담는다. JWT 커스텀 클레임을 쓰지 않는다(설정이 늘고 회전이 어렵다).
- 클라이언트가 보관한 역할은 **화면 분기용일 뿐이며 권한 근거가 아니다.** 실제 판정은 RLS의
  `is_admin()`이 서버에서 다시 한다(원칙 II).
- 로그인 실패는 이메일/비밀번호를 구분하지 않는 단일 문구로 표시한다(FR-003).
- 세션 만료 후 저장 시도는 저장소 계층이 `AuthError`로 변환하고 화면은 재로그인 안내를 표시한다(FR-022).
- 관리자 계정은 화면으로 만들 수 없다. 가입은 항상 `role='member'`이며 승격은 SQL로만 한다(FR-004).

## 10. questions · answers · profiles 데이터 구조

상세는 [`data-model.md`](./data-model.md). 요약:

| 테이블 | 주요 컬럼 | 제약 |
|---|---|---|
| `profiles` | `id`(=`auth.users.id`), `email`, `role`, `created_at` | `role in ('member','admin')` 기본 `member` |
| `questions` | `id`, `author_id`, `title`, `body`, `created_at`, `updated_at` | 제목 1~100자·본문 1~5000자 `CHECK`(공백 제거 후) |
| `answers` | `id`, `question_id`, `admin_id`, `body`, `created_at`, `updated_at` | `question_id` **UNIQUE**(질문당 1개, FR-016), 본문 1~5000자 `CHECK` |

- **`questions`에 상태 컬럼을 두지 않는다.** `답변 대기/완료`는 `answers` 존재 여부에서 도출한다(FR-006).
  목록은 PostgREST 임베딩 `select=id,title,created_at,author_id,answers(id)` 한 번으로 가져오고,
  `toQuestionSummary()` **한 곳에서** 상태를 계산한다. 뷰·트리거·중복 컬럼을 만들지 않는다(원칙 XI).
- 상태 필터는 이 규모에서 **클라이언트에서 좁힌다.** 페이지네이션이 범위 밖이라 전체를 이미 받아오기
  때문이다. 서버 필터가 필요해지면 그때 뷰를 도입한다.
- 질문 삭제 시 답변은 `ON DELETE CASCADE`로 함께 사라진다(FR-013).
- 소프트 삭제를 쓰지 않는다(spec.md Assumptions).

## 11. 회원과 관리자 역할 모델

- 역할은 `profiles.role` 한 곳에만 있다. `member` | `admin` 두 값뿐이며 세 번째를 만들지 않는다.
- 신규 가입은 `auth.users` INSERT 트리거가 `profiles`를 `role='member'`로 생성한다.
- **`profiles`에 UPDATE 정책을 만들지 않는다.** 정책이 없으면 RLS 아래에서 모든 UPDATE가 거부되므로
  사용자가 자기 역할을 바꿀 수 없다. 승격은 `service_role`(SQL)로만 한다(FR-004).
- `is_admin()`은 `SECURITY DEFINER` 함수로 `profiles`를 조회한다. 정책 안에서 `profiles`를 직접 조회하면
  RLS가 재귀 호출되므로 함수로 감싼다.
- 비회원은 `anon` 역할이며 `questions`·`answers`에 대한 정책 조건을 어느 것도 만족하지 못한다.

## 12. RLS 정책

상세 SQL은 [`contracts/rls.md`](./contracts/rls.md). 계약 표:

| 테이블 | 동작 | 정책 조건 | 근거 |
|---|---|---|---|
| `profiles` | SELECT | `id = auth.uid() OR is_admin()` | FR-008 |
| `profiles` | INSERT | 트리거(`SECURITY DEFINER`)만 | FR-001 |
| `profiles` | UPDATE / DELETE | **정책 없음 = 전면 거부** | FR-004 |
| `questions` | SELECT | `author_id = auth.uid() OR is_admin()` | FR-009·FR-018·FR-021 |
| `questions` | INSERT | `author_id = auth.uid() AND NOT is_admin()` | FR-005 |
| `questions` | UPDATE | `author_id = auth.uid() AND NOT EXISTS(answer)` | FR-010·FR-012 |
| `questions` | DELETE | `author_id = auth.uid() AND NOT EXISTS(answer)` | FR-011·FR-012 |
| `answers` | SELECT | 부모 질문이 SELECT 가능할 때 | FR-009 |
| `answers` | INSERT | `is_admin() AND admin_id = auth.uid()` | FR-014·FR-017 |
| `answers` | UPDATE | `is_admin()` | FR-015·FR-017 |
| `answers` | DELETE | **정책 없음 = 전면 거부** | 명세에 답변 삭제 없음(FR-040) |

필수 부수 작업(로컬에서만 통과하는 결함 예방):

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`를 세 테이블 모두에 명시한다.
- **`GRANT`를 별도로 준다.** RLS를 우회하는 `service_role`도 테이블 GRANT는 따로 필요하다. 로컬 기본
  권한이 이 누락을 가려주므로 마이그레이션에 명시적으로 적는다.
- 권한 거부는 "행 0개" 또는 오류로 나타난다. **존재 여부를 알려주는 문구를 만들지 않는다**(FR-021).

## 13. 입력 검증

**단일 출처는 `src/data/validation.ts`이다.**

```ts
export const LIMITS = { title: 100, body: 5000, answer: 5000 } as const;
export const normalize = (s: string) => s.trim();
export function validateTitle(raw: string): string | null   // null = 통과
export function validateBody(raw: string): string | null
export function validateAnswer(raw: string): string | null
```

3중 방어:

1. **클라이언트**: `Field`가 위 함수를 호출해 필드별 오류를 표시한다(FR-026). 오류 문구는 design.md 12절.
2. **저장소 계층**: `repository`가 저장 직전 같은 함수를 다시 호출한다. 폼을 거치지 않는 호출도 막는다.
3. **데이터베이스**: `CHECK (char_length(btrim(title)) between 1 and 100)` 등이 최종 강제한다(FR-027).
   화면과 API를 우회한 직접 SQL도 여기서 막힌다.

- 공백만 있는 입력은 `btrim` 후 길이 0이므로 빈 입력으로 취급된다(FR-026).
- 스크립트 삽입은 React가 기본 이스케이프하므로 **`dangerouslySetInnerHTML`을 쓰지 않는 것**이 대응이다
  (FR-028). ESLint `react/no-danger`를 error로 켠다.
- 오류 메시지에 서버 예외를 넣지 않는다(FR-032).

## 14. 테스트 전략

TDD 순서를 따른다: 테스트 작성 → 실패 확인 → 구현 → 통과 → 커밋(헌장 개발 워크플로).

| 층 | 도구 | 대상 | 근거 |
|---|---|---|---|
| 단위 | Vitest | `validation.ts` 경계값 **0·1·최대·최대+1·공백만** × 제목/내용/답변 = 15케이스 | FR-023~025, SC-006 |
| 단위 | Vitest | `toQuestionSummary()` 상태 도출, 날짜 표기 | FR-006 |
| 컴포넌트 | Vitest + Testing Library | `Badge`에 텍스트가 항상 있음 / `StateBox` 5변형 문구 / 역할별 버튼 **존재·부재** | FR-030, FR-012, FR-017 |
| 계약(RLS) | Vitest + supabase-js | 회원A·회원B·관리자·익명 4개 클라이언트로 12개 정책 행을 **직접 호출**해 검증 | FR-018~022, SC-005, 원칙 II |
| 접근성 | Playwright + axe | 세 화면 위반 0건, 포커스 표시 존재, 라벨 연결 | FR-036, 원칙 VIII·IX |
| 대비 | 자체 스크립트 | `tokens.css` 조합을 계산해 4.5:1 / 3:1 확인, 미달 시 실패 | 원칙 VI |
| 시각 | Playwright | **회색조 변환** 스크린샷에서 상태 구분 / `reducedMotion:'reduce'` 스크린샷 | SC-009, FR-038 |
| E2E | Playwright(1440·390) | 회원 가입→작성→상태 확인→답변 확인 / 관리자 로그인→대기 탐색→답변 | SC-001·003·007 |
| E2E | Playwright | **키보드 전용**으로 주요 행동 8종 완료 | SC-008 |

- RLS 테스트는 **UI를 거치지 않는다.** 이것이 원칙 II의 검토 기준을 만족하는 유일한 방법이다.
- 테스트 비활성화·건너뛰기를 금지한다. `--no-verify` 금지(원칙 XIII).
- CI/커밋 전 `npm run verify` = `typecheck && lint && stylelint && test && contrast && build`.

## 15. Mock Data 기반 UI 우선 구현 방법

**목표: Supabase 없이도 세 핵심 화면을 완주 검증할 수 있게 한다.**

```ts
// data/repository.ts
export interface QuestionRepository {
  listQuestions(viewer: Viewer): Promise<QuestionSummary[]>;
  getQuestion(id: string, viewer: Viewer): Promise<QuestionDetail>;   // 권한 없으면 UnauthorizedError
  createQuestion(input: QuestionInput, viewer: Viewer): Promise<string>;
  updateQuestion(id: string, input: QuestionInput, viewer: Viewer): Promise<void>;
  deleteQuestion(id: string, viewer: Viewer): Promise<void>;
  upsertAnswer(questionId: string, body: string, viewer: Viewer): Promise<void>;
}
export const repository: QuestionRepository =
  import.meta.env.VITE_DATA_SOURCE === 'supabase' ? supabaseRepository : mockRepository;
```

- `mockRepository`는 `fixtures.ts`의 배열을 메모리에서 다루며 **같은 권한 규칙을 그대로 재현**한다
  (타인 질문 접근 시 `UnauthorizedError`, 답변 후 수정 시 `ForbiddenError`). 그래야 UI 분기를 미리 검증할 수 있다.
- `mockRepository`는 인위적 지연(300ms)과 `?fail=1` 질의로 오류를 재현해 **Loading·Error 상태를 실제로**
  볼 수 있게 한다.
- Mock 모드에서는 `AuthProvider`가 URL 질의(`?as=guest|member|admin`)로 역할을 바꾼다. 프로토타입의
  조작 바와 같은 역할이며 **Supabase 모드에서는 비활성**이다.
- `fixtures.ts`는 단위·컴포넌트·E2E 테스트가 공유한다.
- 이메일 예시는 `@example.com`을 쓰되, **Supabase 연결 단계의 실계정 시드에는 쓰지 않는다** — 호스티드
  Auth가 테스트 도메인 가입을 거부한다.

**단계**

| 단계 | 내용 | 완료 조건 |
|---|---|---|
| A1 | 토큰·base·motion CSS + 공통 컴포넌트 12개 | 컴포넌트 테스트 통과, 대비 스크립트 통과 |
| A2 | 세 화면 + 인증 화면을 Mock으로 완성 | 1440·390 E2E 통과, axe 0건 |
| A3 | 상태 5종·삭제 확인·역할 분기 | design.md 24절 A~H 전 항목 통과 |

## 16. UI 구현 이후 `/design-sync` 실행 시점과 범위

**시점**: 위 **A3 완료 직후, Supabase 연결(단계 B) 시작 전**. 즉 화면이 확정되고 값이 더는 흔들리지 않는
시점이다. 데이터 연결 코드가 섞이기 전에 올려야 컴포넌트 미리보기가 순수하게 유지된다.

**선행 조건 (확인된 사실)**: `/design-sync`는 로컬 컴포넌트 라이브러리를 **`PROJECT_TYPE_DESIGN_SYSTEM`
타입 프로젝트**에 동기화한다. 현재 시안 프로젝트(`QANOW — 메인 페이지 시각 방향`)는 일반 design
프로젝트이며 **타입은 생성 시 고정이라 나중에 바꿀 수 없다.** 따라서 `create_project`로
**`QANOW Design System`을 새로 만들어야 한다.** 기존 시안 프로젝트는 시안 기록으로 그대로 둔다.

**범위 — 올리는 것**

| 그룹 | 카드 |
|---|---|
| Foundations | 토큰(색·타이포·간격) 미리보기, 대비 표 |
| Actions | Button 5 variant × 상태(기본·hover·focus·disabled·loading) |
| Forms | Input, Textarea, Field(도움말·글자 수·오류) |
| Status | Badge 7종(밝은/어두운), StateBox 5변형, Skeleton |
| Navigation | Header(비회원·회원·관리자), PageHeader, StatusTabs |
| Question | QuestionRow(대기/완료·회원/관리자), QuestionCard, AnswerBlock(있음/없음), DeleteConfirm |
| Hero | AuroraBackdrop, FloatingQaCards, FlowSteps |

**범위 — 올리지 않는 것**: 페이지 컴포넌트, 라우터, `AuthProvider`, `repository`/Supabase 코드,
테스트, 환경 변수. 컴포넌트 라이브러리만 올린다.

**절차**: `list_projects` → (없으면) `create_project` → 로컬 `ds-bundle/`에 카드용 미리보기 HTML 생성
(각 파일 첫 줄에 `<!-- @dsCard group="…" -->`) → `finalize_plan`으로 경로 집합과 `localDir` 확정 →
`write_files`. **한 번에 전부 갈아엎지 않고 컴포넌트 단위로 올린다.**

**재실행 시점**: 컴포넌트의 시각 규격이 바뀔 때만. 페이지 로직 변경으로는 재실행하지 않는다.

## 17. 로컬 실행 방법

상세는 [`quickstart.md`](./quickstart.md).

```bash
npm install                 # 설치 1명령

npm run dev                 # Mock 모드, http://localhost:5174
npm run dev:supabase        # Supabase 모드, http://localhost:5175

npm run verify              # typecheck + lint + stylelint + test + contrast + build
npm test                    # 단위·컴포넌트
npm run test:e2e            # Playwright (1440 / 390 / reduced-motion)
npm run test:rls            # RLS 계약 (Supabase 필요)
```

- 포트 **5174 / 5175**. 상위 워크스페이스가 쓰는 **3777~3779를 피한다**(헌장 추가 제약).
- 환경 변수는 `.env.local`(커밋 금지). `.env.example`만 저장소에 둔다.
  ```
  VITE_DATA_SOURCE=mock            # mock | supabase
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  ```
- `lib/env.ts`가 기동 시 필수 변수의 **존재와 비어 있지 않음을 함께** 검사하고, 실패하면 흰 화면 대신
  읽을 수 있는 오류 화면을 렌더한다. 배포 플랫폼은 값 없이 만든 변수를 **빈 문자열**로 주입하므로
  `x ?? '기본값'`이 동작하지 않는다.
- Mock 모드는 Supabase 없이 동작한다. 위 두 변수가 비어 있어도 `npm run dev`가 뜬다.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| ~~상태 필터가 FR 없이 존재~~ **(해소됨)** | — | **2026-08-29 `FR-041` 추가로 위반이 사라졌다.** 정당화가 아니라 명세 개정으로 닫았다 |
| **`QuestionRepository` 추상화 계층 1겹 추가**(원칙 XI 심사 대상) | "데이터 연결 전에 Mock으로 세 화면을 검증한다"는 요구를 만족하는 최소 수단이다. 인터페이스 1개 + 구현 2개로 끝난다 | 페이지가 `supabase-js`를 직접 부르면 Mock 단계 자체가 불가능하고, 검증 규칙이 페이지마다 흩어져 원칙 III을 깨뜨린다. 레포지토리 패턴 전체(엔터티 매퍼·유닛오브워크)는 도입하지 않는다 |
| **Supabase 외부 의존성 도입**(원칙 XI 심사 대상) | 별도 백엔드 서버 없이 원칙 II(데이터 계층 권한 강제)를 만족시키는 수단이 RLS이다 | 클라이언트만으로는 권한을 강제할 수 없고, 자체 백엔드 서버는 MVP 범위를 크게 넘긴다 |

## Post-Design Constitution Re-check

Phase 1 산출물(`data-model.md`, `contracts/`, `quickstart.md`)까지 반영한 재확인 결과:

- 원칙 II: 12개 정책 행이 모두 테스트 대상으로 `contracts/rls.md`에 표로 고정되었다. **통과.**
- 원칙 III: 검증이 클라이언트·저장소·DB 세 지점에서 같은 규칙을 참조한다. **통과.**
- 원칙 XI: 테이블 3개·뷰 0개·트리거 1개·추가 계층 1겹. 상태 컬럼과 뷰를 만들지 않아 구조가 늘지 않았다. **통과.**
- 원칙 IV: **해소.** `FR-041`이 추가되어 상태 필터가 명세 근거를 갖는다. 차단 없음.

## 미결 사항 (태스크 착수 전 정리)

| # | 항목 | 결정 필요 | 이 계획의 잠정 처리 |
|---|---|---|---|
| ~~1~~ | ~~`FR-041` 추가~~ | ✅ 2026-08-29 승인·반영 | — |
| 2 | 회원가입 필드(clarify Q3) | 사용자 | 이메일·비밀번호만. 표시 이름 없음 |
| 3 | 비회원 CTA 표현(clarify Q4) | 사용자 | 로그인 안내 화면으로 이동(모달 아님) |
| 4 | 한글 웹폰트 실제 로딩 | 확인 | `Gothic A1` 사용. 브라우저 확인 후 확정 |
| 5 | 관리자 계정 시드 방법 | 운영 | 실제 도메인 이메일로 가입 후 SQL로 `role='admin'` 승격 |
