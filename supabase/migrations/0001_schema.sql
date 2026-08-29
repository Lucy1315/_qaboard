-- T042 — data-model.md. 테이블 3개뿐이며 뷰·상태 컬럼을 만들지 않는다(헌장 원칙 XI).

create extension if not exists pgcrypto;

-- ── profiles ─────────────────────────────────────────────────────────────
-- auth.users 와 1:1. 애플리케이션이 보유한 유일한 사용자 식별 정보는 이메일이다(FR-008).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text        not null,
  role       text        not null default 'member',
  created_at timestamptz not null default now(),
  constraint profiles_role_valid check (role in ('member', 'admin'))
);

comment on column public.profiles.role is
  '역할은 여기 한 곳에만 있다. UPDATE 정책이 없어 사용자가 스스로 바꿀 수 없다 (FR-004).';

-- ── questions ────────────────────────────────────────────────────────────
-- 상태 컬럼을 두지 않는다. 답변 대기/완료는 answers 존재 여부에서 도출한다(FR-006).
create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid        not null references public.profiles(id) on delete cascade,
  title      text        not null,
  body       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 화면과 저장소를 우회한 직접 SQL 까지 막는 최종 검증 지점이다 (FR-023·FR-024·FR-027).
  constraint questions_title_len check (char_length(btrim(title)) between 1 and 100),
  constraint questions_body_len  check (char_length(btrim(body))  between 1 and 5000)
);

create index if not exists questions_author_created_idx
  on public.questions (author_id, created_at desc);
create index if not exists questions_created_idx
  on public.questions (created_at desc);

-- ── answers ──────────────────────────────────────────────────────────────
-- unique(question_id) 가 "질문당 답변 하나"를 스키마 수준에서 강제한다(FR-016).
-- 애플리케이션 검사에 의존하지 않는다.
create table if not exists public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid        not null unique references public.questions(id) on delete cascade,
  admin_id    uuid        not null references public.profiles(id),
  body        text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint answers_body_len check (char_length(btrim(body)) between 1 and 5000)
);

-- ── updated_at 자동 갱신 ─────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists questions_touch on public.questions;
create trigger questions_touch before update on public.questions
  for each row execute function public.touch_updated_at();

drop trigger if exists answers_touch on public.answers;
create trigger answers_touch before update on public.answers
  for each row execute function public.touch_updated_at();
