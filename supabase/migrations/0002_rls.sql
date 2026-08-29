-- T044·T045·T046 — contracts/rls.md 의 12개 정책.
-- 백엔드 서버가 없으므로 헌장 원칙 II 의 "데이터 계층"은 여기다.
-- UI 를 거치지 않는 직접 호출로 검증한다(tests/rls/).

-- ── 헬퍼 ─────────────────────────────────────────────────────────────────
-- SECURITY DEFINER 가 필수다. 정책 안에서 profiles 를 직접 조회하면
-- profiles 의 RLS 가 다시 평가되어 무한 재귀가 난다(research R5).
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── RLS 켜기 ─────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.questions enable row level security;
alter table public.answers   enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());          -- P1 (FR-021)

-- P2·P3·P4 — INSERT/UPDATE/DELETE 정책을 만들지 않는다.
-- 정책이 없으면 RLS 아래에서 전부 거부되므로 사용자가 자기 role 을 바꿀 수 없다(FR-004).
-- 프로필 생성은 handle_new_user() 트리거(SECURITY DEFINER)만 한다.

-- ── questions ────────────────────────────────────────────────────────────
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
  for select to authenticated
  using (author_id = auth.uid() or public.is_admin());   -- P5 (FR-009·018·021)

drop policy if exists questions_insert on public.questions;
create policy questions_insert on public.questions
  for insert to authenticated
  with check (author_id = auth.uid() and not public.is_admin());  -- P6 (FR-005)

drop policy if exists questions_update on public.questions;
create policy questions_update on public.questions
  for update to authenticated
  using (
    author_id = auth.uid()
    and not exists (select 1 from public.answers a where a.question_id = questions.id)
  )
  with check (author_id = auth.uid());                   -- P7 (FR-010·012·018)

drop policy if exists questions_delete on public.questions;
create policy questions_delete on public.questions
  for delete to authenticated
  using (
    author_id = auth.uid()
    and not exists (select 1 from public.answers a where a.question_id = questions.id)
  );                                                     -- P8 (FR-011·012·018)

-- ── answers ──────────────────────────────────────────────────────────────
drop policy if exists answers_select on public.answers;
create policy answers_select on public.answers
  for select to authenticated
  using (
    exists (
      select 1 from public.questions q
      where q.id = answers.question_id
        and (q.author_id = auth.uid() or public.is_admin())
    )
  );                                                     -- P9 (FR-009)

drop policy if exists answers_insert on public.answers;
create policy answers_insert on public.answers
  for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());  -- P10 (FR-014·017)

drop policy if exists answers_update on public.answers;
create policy answers_update on public.answers
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());                        -- P11 (FR-015·017)

-- P12 — DELETE 정책 없음 = 전면 거부. 명세에 답변 삭제가 없다(FR-040).

-- ── GRANT ────────────────────────────────────────────────────────────────
-- RLS 를 우회하는 service_role 조차 테이블 GRANT 는 따로 필요하다.
-- 로컬 기본 권한이 이 누락을 가려주므로 명시적으로 적는다.
grant usage on schema public to anon, authenticated;
grant select                         on public.profiles  to authenticated;
grant select, insert, update, delete on public.questions to authenticated;
grant select, insert, update         on public.answers   to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
