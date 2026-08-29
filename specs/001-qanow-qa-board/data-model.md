# Phase 1 — Data Model: QANOW

**Date**: 2026-08-29 | **Plan**: [plan.md](./plan.md) | **근거**: spec.md Key Entities, FR-001~FR-017

테이블 3개뿐이며 뷰·트리거(1개 제외)·상태 컬럼을 만들지 않는다(헌장 원칙 XI).

## 1. `profiles`

`auth.users`와 1:1로 대응하는 애플리케이션 프로필이다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, `references auth.users(id) on delete cascade` | 사용자 식별자 |
| `email` | `text` | `not null` | **유일한 작성자 식별값**(FR-008) |
| `role` | `text` | `not null default 'member'`, `check (role in ('member','admin'))` | 역할(FR-004) |
| `created_at` | `timestamptz` | `not null default now()` | — |

- 닉네임·프로필 이미지 컬럼을 만들지 않는다(명세에 없음, FR-040·원칙 IV).
- `auth.users` INSERT 트리거가 `role='member'`로 자동 생성한다.
- **UPDATE 정책이 없다** → 사용자가 자기 역할을 바꿀 수 없다.

## 2. `questions`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK `default gen_random_uuid()` | — |
| `author_id` | `uuid` | `not null references profiles(id) on delete cascade` | 작성자(FR-018) |
| `title` | `text` | `not null`, `check (char_length(btrim(title)) between 1 and 100)` | FR-023 |
| `body` | `text` | `not null`, `check (char_length(btrim(body)) between 1 and 5000)` | FR-024 |
| `created_at` | `timestamptz` | `not null default now()` | 목록 정렬 기준(최신순) |
| `updated_at` | `timestamptz` | `not null default now()` | 수정 시각 |

- **상태 컬럼이 없다.** `답변 대기`/`답변 완료`는 `answers` 존재 여부에서 도출한다(FR-006, research R2).
- 인덱스: `(author_id, created_at desc)` — 회원 목록, `(created_at desc)` — 관리자 목록.
- `CHECK`가 화면·API를 우회한 직접 SQL까지 막는 최종 검증 지점이다(FR-027).

## 3. `answers`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK `default gen_random_uuid()` | — |
| `question_id` | `uuid` | `not null`, **`unique`**, `references questions(id) on delete cascade` | **질문당 1개**(FR-016) |
| `admin_id` | `uuid` | `not null references profiles(id)` | 답변한 관리자(FR-014) |
| `body` | `text` | `not null`, `check (char_length(btrim(body)) between 1 and 5000)` | FR-025 |
| `created_at` | `timestamptz` | `not null default now()` | — |
| `updated_at` | `timestamptz` | `not null default now()` | 수정해도 상태는 유지(FR-015) |

- `unique(question_id)`가 FR-016을 스키마 수준에서 강제한다. 애플리케이션 검사에 의존하지 않는다.
- `on delete cascade`로 질문 삭제 시 답변도 사라진다(FR-013).
- **DELETE 정책이 없다** → 답변 삭제 기능이 없다(명세에 없음, FR-040).

## 4. 관계와 생애주기

```
auth.users 1─1 profiles 1─N questions 1─0..1 answers
                      └───────N answers (admin_id)
```

| 전이 | 조건 | 근거 |
|---|---|---|
| 질문 생성 → `답변 대기` | 회원이 작성 | FR-005·FR-006 |
| 질문 수정 | 작성자 본인 + 답변 없음 | FR-010·FR-012 |
| 질문 삭제 | 작성자 본인 + 답변 없음 + 확인 단계 | FR-011·FR-012 |
| `답변 대기` → `답변 완료` | 관리자가 답변 INSERT | FR-014 |
| 답변 수정 | 관리자, 상태 유지 | FR-015 |
| 답변 삭제 | **불가** | FR-040 |

## 5. 애플리케이션 타입

```ts
export type Role = 'member' | 'admin';
export type QuestionStatus = 'wait' | 'done';   // 표시 문구: 답변 대기 / 답변 완료

export type QuestionSummary = {
  id: string; title: string; createdAt: string;
  authorEmail?: string;          // 관리자에게만 채워진다 (FR-008)
  status: QuestionStatus;        // answers 존재 여부에서 도출
};

export type QuestionDetail = QuestionSummary & {
  body: string; updatedAt: string;
  answer: { body: string; createdAt: string; updatedAt: string } | null;
};
```

`status`는 `toQuestionSummary()` **한 곳에서만** 계산한다. 화면마다 다시 계산하지 않는다(FR-039).
