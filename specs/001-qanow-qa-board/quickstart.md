# Quickstart — QANOW

**Date**: 2026-08-29 | **Plan**: [plan.md](./plan.md)

## 요구 사항

Node 20+ / npm. Supabase는 **Mock 모드에서 필요하지 않다.**

## 설치와 실행

```bash
npm install          # 설치 1명령

npm run dev          # Mock 모드  → http://localhost:5174
npm run dev:supabase # Supabase   → http://localhost:5175
```

포트 **5174 / 5175**를 쓴다. 상위 워크스페이스가 쓰는 3777~3779를 피한다(헌장 추가 제약).

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만든다. **`.env.local`은 커밋하지 않는다.**

```
VITE_DATA_SOURCE=mock
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

`lib/env.ts`가 기동 시 **존재와 비어 있지 않음을 함께** 검사한다. 배포 플랫폼은 값 없이 만든 변수를
빈 문자열로 주입하므로 `x ?? '기본값'`은 동작하지 않는다. 검사 실패 시 흰 화면 대신 오류 화면이 뜬다.

## Mock 모드로 화면 확인하기

Supabase 없이 세 화면을 모두 볼 수 있다. 역할은 URL 질의로 바꾼다(**Mock 모드 전용**).

| URL | 보이는 것 |
|---|---|
| `http://localhost:5174/` | 메인 |
| `/questions?as=guest` | 로그인 안내 |
| `/questions?as=member` | 내 질문(본인 것만) |
| `/questions?as=admin` | 문의 관리(전체, 기본 필터 `답변 대기`) |
| `/questions/q1?as=member` | 질문 상세(답변 전) |
| `/questions/q3?as=member` | 질문 상세(답변 후 — 수정·삭제 버튼 없음) |
| `/questions/q1?as=admin` | 관리자 답변 작성 |
| `/questions/new?as=member` | 질문 작성 |
| 어느 화면이든 `&fail=1` | 오류 상태 |
| 어느 화면이든 `&empty=1` | 빈 목록 |

## 검증 명령

```bash
npm run verify       # typecheck + lint + stylelint + test + contrast + build
npm test             # 단위·컴포넌트 (Vitest)
npm run test:e2e     # Playwright (1440 / 390 / reduced-motion)
npm run test:rls     # RLS 계약 12행 (Supabase 필요)
npm run contrast     # tokens.css 대비 계산 — 기준 미달 시 실패
```

**커밋 전에 `npm run verify`가 통과해야 한다. `--no-verify`를 쓰지 않는다**(헌장 원칙 XIII).

## Supabase 연결 (Phase 5 이후)

```bash
supabase start                  # 로컬 스택
supabase db reset               # migrations + seed 적용
npm run dev:supabase
```

### RLS 계약 테스트에 필요한 환경 변수

`tests/rls/` 는 회원 A·회원 B·관리자 세 계정으로 12개 정책을 **UI 를 거치지 않고** 검증한다.
아래가 비어 있으면 전체를 건너뛰며, 건너뛴 것은 **통과가 아니다**.

```
SUPABASE_URL=            SUPABASE_ANON_KEY=
RLS_MEMBER_A_EMAIL=      RLS_MEMBER_A_PASSWORD=
RLS_MEMBER_B_EMAIL=      RLS_MEMBER_B_PASSWORD=
RLS_ADMIN_EMAIL=         RLS_ADMIN_PASSWORD=
```

관리자 계정은 화면으로 만들 수 없다(FR-004). 일반 가입 후 SQL로 승격한다.

```sql
update public.profiles set role = 'admin' where email = '<실제 이메일>';
```

**`@example.com` 같은 테스트 도메인은 호스티드 Auth가 가입을 거부한다.** 실제 도메인 주소를 쓴다.

## 주의

- **로컬에서 통과했다고 "된다"고 말하지 않는다.** 배포 환경에서 실제로 확인한 뒤 완료로 본다(원칙 XIII).
- `npm run dev` 실행 중에 같은 디렉터리로 `npm run build`를 돌리지 않는다.
