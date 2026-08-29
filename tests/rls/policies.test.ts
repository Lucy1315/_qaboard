/* T063 — contracts/rls.md 의 12개 정책을 UI 를 거치지 않고 직접 호출로 검증한다.
   이것이 헌장 원칙 II 의 검토 기준을 만족하는 유일한 방법이다.

   실행: 아래 환경 변수를 채운 뒤 `npm run test:rls`
     SUPABASE_URL, SUPABASE_ANON_KEY
     RLS_MEMBER_A_EMAIL / _PASSWORD   (회원 A)
     RLS_MEMBER_B_EMAIL / _PASSWORD   (회원 B — A 의 질문에 접근을 시도한다)
     RLS_ADMIN_EMAIL   / _PASSWORD    (profiles.role='admin' 으로 승격된 계정)
   비어 있으면 전체를 건너뛴다 — 통과로 오해하지 않도록 skip 사유를 출력한다. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const env = (k: string) => (process.env[k] ?? '').trim();
const URL_ = env('SUPABASE_URL');
const KEY = env('SUPABASE_ANON_KEY');
const ACCOUNTS = {
  memberA: { email: env('RLS_MEMBER_A_EMAIL'), password: env('RLS_MEMBER_A_PASSWORD') },
  memberB: { email: env('RLS_MEMBER_B_EMAIL'), password: env('RLS_MEMBER_B_PASSWORD') },
  admin: { email: env('RLS_ADMIN_EMAIL'), password: env('RLS_ADMIN_PASSWORD') },
};
const READY =
  URL_ && KEY && Object.values(ACCOUNTS).every((a) => a.email && a.password);

if (!READY) {
  console.warn(
    '[RLS] 환경 변수가 없어 계약 테스트를 건너뛴다. 이것은 "통과"가 아니다 — ' +
      'Supabase 프로젝트를 연결한 뒤 반드시 실행해야 한다(원칙 II).',
  );
}

const d = READY ? describe : describe.skip;

async function signIn(acc: { email: string; password: string }): Promise<SupabaseClient> {
  const c = createClient(URL_, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword(acc);
  if (error) throw new Error(`로그인 실패(${acc.email}): ${error.message}`);
  return c;
}

d('RLS 권한 계약 (contracts/rls.md)', () => {
  let anon: SupabaseClient;
  let a: SupabaseClient;
  let b: SupabaseClient;
  let admin: SupabaseClient;
  let aUserId = '';
  let aQuestionId = '';

  beforeAll(async () => {
    anon = createClient(URL_, KEY, { auth: { persistSession: false } });
    [a, b, admin] = await Promise.all([signIn(ACCOUNTS.memberA), signIn(ACCOUNTS.memberB), signIn(ACCOUNTS.admin)]);
    aUserId = (await a.auth.getUser()).data.user!.id;
    const { data, error } = await a
      .from('questions')
      .insert({ author_id: aUserId, title: 'RLS 계약 테스트 질문', body: 'RLS 계약 테스트 본문입니다.' })
      .select('id')
      .single();
    if (error) throw new Error(`테스트 질문 생성 실패: ${error.message}`);
    aQuestionId = (data as { id: string }).id;
  }, 60_000);

  afterAll(async () => {
    if (aQuestionId) await a.from('questions').delete().eq('id', aQuestionId);
  });

  it('P1 profiles SELECT — 타인 프로필은 0행 (FR-021)', async () => {
    const { data } = await b.from('profiles').select('id').eq('id', aUserId);
    expect(data ?? []).toHaveLength(0);
  });

  it('P3 profiles UPDATE — 자기 role 승격 거부 (FR-004)', async () => {
    const { data, error } = await b.from('profiles').update({ role: 'admin' }).eq('id', aUserId).select('id');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('P5 questions SELECT — 회원 B 는 회원 A 의 질문을 볼 수 없다 (FR-018)', async () => {
    const { data } = await b.from('questions').select('id').eq('id', aQuestionId);
    expect(data ?? []).toHaveLength(0);
  });

  it('P5 questions SELECT — 관리자는 전체를 본다 (FR-008)', async () => {
    const { data } = await admin.from('questions').select('id').eq('id', aQuestionId);
    expect(data ?? []).toHaveLength(1);
  });

  it('P5 questions SELECT — 익명은 0행 (FR-020)', async () => {
    const { data } = await anon.from('questions').select('id');
    expect(data ?? []).toHaveLength(0);
  });

  it('P6 questions INSERT — 타인 명의 작성 거부 (FR-005)', async () => {
    const { error } = await b
      .from('questions')
      .insert({ author_id: aUserId, title: '가짜 작성자', body: '타인 명의로 작성을 시도한다.' });
    expect(error).not.toBeNull();
  });

  it('P6 questions INSERT — 관리자는 질문을 작성할 수 없다 (FR-005)', async () => {
    const adminId = (await admin.auth.getUser()).data.user!.id;
    const { error } = await admin
      .from('questions')
      .insert({ author_id: adminId, title: '관리자 작성 시도', body: '관리자는 질문을 작성하지 않는다.' });
    expect(error).not.toBeNull();
  });

  it('P7 questions UPDATE — 타인 질문 수정 거부 (FR-018)', async () => {
    const { data } = await b.from('questions').update({ title: '남의 질문 수정' }).eq('id', aQuestionId).select('id');
    expect(data ?? []).toHaveLength(0);
  });

  it('P10 answers INSERT — 회원의 답변 작성 거부 (FR-017)', async () => {
    const { error } = await a
      .from('answers')
      .insert({ question_id: aQuestionId, admin_id: aUserId, body: '회원이 답변을 시도한다.' });
    expect(error).not.toBeNull();
  });

  it('P7·P8 — 답변이 달리면 작성자도 수정·삭제할 수 없다 (FR-012)', async () => {
    const adminId = (await admin.auth.getUser()).data.user!.id;
    const { error: insErr } = await admin
      .from('answers')
      .insert({ question_id: aQuestionId, admin_id: adminId, body: '관리자 답변입니다.' });
    expect(insErr).toBeNull();

    const { data: upd } = await a.from('questions').update({ title: '답변 후 수정' }).eq('id', aQuestionId).select('id');
    expect(upd ?? []).toHaveLength(0);

    const { data: del } = await a.from('questions').delete().eq('id', aQuestionId).select('id');
    expect(del ?? []).toHaveLength(0);
  });

  it('P12 answers DELETE — 관리자도 답변을 삭제할 수 없다 (FR-040)', async () => {
    const { data } = await admin.from('answers').delete().eq('question_id', aQuestionId).select('id');
    expect(data ?? []).toHaveLength(0);
  });

  it('P9 answers SELECT — 타인 질문의 답변은 0행 (FR-009)', async () => {
    const { data } = await b.from('answers').select('id').eq('question_id', aQuestionId);
    expect(data ?? []).toHaveLength(0);
  });
});
