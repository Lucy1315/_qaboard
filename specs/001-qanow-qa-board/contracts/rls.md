# Contract — RLS 권한 계약

**Date**: 2026-08-29 | 헌장 원칙 II(데이터 계층 권한 강제)의 검토 기준을 만족시키는 계약이다.
아래 12개 행은 모두 **UI를 거치지 않는 직접 호출**로 검증한다(`tests/rls/`).

## 헬퍼

```sql
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
```
`SECURITY DEFINER`가 필수이다. 정책 안에서 `profiles`를 직접 조회하면 RLS가 재귀한다(research R5).

## 정책 표 (테스트 대상)

| # | 테이블 | 동작 | 정책 조건 | 기대 | 근거 |
|---|---|---|---|---|---|
| P1 | profiles | SELECT | `id = auth.uid() or is_admin()` | 타인 프로필 0행 | FR-021 |
| P2 | profiles | INSERT | 트리거(정책 없음) | 직접 INSERT 거부 | FR-001 |
| P3 | profiles | UPDATE | **정책 없음** | 자기 `role` 변경 거부 | FR-004 |
| P4 | profiles | DELETE | **정책 없음** | 거부 | — |
| P5 | questions | SELECT | `author_id = auth.uid() or is_admin()` | 회원B가 회원A 질문 조회 시 0행 | FR-009·FR-018·FR-021 |
| P6 | questions | INSERT | `author_id = auth.uid() and not is_admin()` | 타인 명의 INSERT 거부, 관리자 INSERT 거부 | FR-005 |
| P7 | questions | UPDATE | `author_id = auth.uid() and not exists (select 1 from answers a where a.question_id = questions.id)` | 답변 후 수정 거부, 타인 수정 거부 | FR-010·FR-012·FR-018 |
| P8 | questions | DELETE | 위와 동일 조건 | 답변 후 삭제 거부, 타인 삭제 거부 | FR-011·FR-012·FR-018 |
| P9 | answers | SELECT | 부모 질문이 SELECT 가능 | 타인 질문의 답변 0행 | FR-009 |
| P10 | answers | INSERT | `is_admin() and admin_id = auth.uid()` | 회원의 답변 작성 거부 | FR-014·FR-017 |
| P11 | answers | UPDATE | `is_admin()` | 회원의 답변 수정 거부 | FR-015·FR-017 |
| P12 | answers | DELETE | **정책 없음** | 관리자도 거부 | FR-040 |

## 익명(비회원)

`anon` 역할은 P5·P9의 조건(`auth.uid()`가 NULL)을 만족하지 못하므로 모든 질문·답변 조회가 0행이다(FR-020).

## 필수 부수 작업

```sql
alter table public.profiles  enable row level security;
alter table public.questions enable row level security;
alter table public.answers   enable row level security;

grant usage on schema public to anon, authenticated;
grant select                         on public.profiles  to authenticated;
grant select, insert, update, delete on public.questions to authenticated;
grant select, insert, update         on public.answers   to authenticated;
```

**`GRANT`를 빠뜨리지 않는다.** RLS를 우회하는 `service_role`조차 테이블 GRANT는 따로 필요하며,
로컬 기본 권한이 이 누락을 가려주어 배포 후에야 드러난다.

## 거부 표현 규칙

권한 거부는 "행 0개" 또는 오류로 나타난다. 화면은 이를 `unauthorized` 상태로 바꿔
`이 질문에 접근할 권한이 없습니다.`만 표시하고 **질문의 존재 여부를 알려주지 않는다**(FR-021).
