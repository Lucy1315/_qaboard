/* T047 — contracts/repository.md 의 동치 조건 7항목을 mockRepository 와 동일하게 지킨다.
   권한 판정은 여기서 하지 않는다. RLS 가 거부하면 행이 0개로 오거나 오류가 난다(원칙 II). */
import type { QuestionRepository } from './repository';
import type { QuestionDetail, QuestionInput, QuestionSummary, Viewer } from './types';
import {
  AnsweredLockError,
  AuthRequiredError,
  RepositoryError,
  UnauthorizedError,
  ValidationError,
} from './errors';
import { normalize, validateAnswer, validateBody, validateTitle } from './validation';
import { getSupabase } from '../lib/supabase';

type AnswerRow = { id: string; body?: string; created_at?: string; updated_at?: string };
/** PostgREST 임베딩은 to-one 관계도 배열로 돌려줄 수 있어 두 모양을 모두 받는다. */
type EmbeddedProfile = { email: string } | { email: string }[] | null;
type QuestionRow = {
  id: string;
  title: string;
  body?: string;
  created_at: string;
  updated_at?: string;
  author_id: string;
  profiles?: EmbeddedProfile;
  answers?: AnswerRow[] | null;
};

const emailOf = (p: EmbeddedProfile | undefined): string | undefined =>
  Array.isArray(p) ? p[0]?.email : (p?.email ?? undefined);

function requireAuth(viewer: Viewer): asserts viewer is Extract<Viewer, { role: 'member' | 'admin' }> {
  if (viewer.role === 'anon') throw new AuthRequiredError();
}

/** 상태는 answers 존재 여부에서 도출한다. 이 계산은 여기 한 곳에만 있다 (FR-006). */
function toQuestionSummary(r: QuestionRow, viewer: Viewer): QuestionSummary {
  const answered = Array.isArray(r.answers) && r.answers.length > 0;
  return {
    id: r.id,
    title: r.title,
    createdAt: r.created_at,
    status: answered ? 'done' : 'wait',
    authorEmail: viewer.role === 'admin' ? emailOf(r.profiles) : undefined,
  };
}

/** 저장 직전 다시 검증한다 — 폼을 거치지 않은 호출도 막는다 (FR-027). */
function assertQuestionInput(input: QuestionInput): void {
  const t = validateTitle(input.title);
  if (t) throw new ValidationError('title', t);
  const b = validateBody(input.body);
  if (b) throw new ValidationError('body', b);
}

/** RLS 거부와 제약 위반을 화면이 이해하는 오류로 바꾼다. 원본 메시지를 노출하지 않는다(FR-032). */
function toRepositoryError(err: { code?: string; message?: string } | null): never {
  if (err?.code === '42501' || err?.code === 'PGRST301') throw new UnauthorizedError();
  console.error('[repository]', err);
  throw new RepositoryError();
}

const LIST_SELECT = 'id,title,created_at,author_id,answers(id),profiles!questions_author_id_fkey(email)';
const DETAIL_SELECT =
  'id,title,body,created_at,updated_at,author_id,answers(id,body,created_at,updated_at),profiles!questions_author_id_fkey(email)';

export const supabaseRepository: QuestionRepository = {
  async listQuestions(viewer) {
    requireAuth(viewer);
    // 회원은 RLS 가 이미 자기 질문만 돌려준다. 클라이언트에서 다시 거르지 않는다.
    const { data, error } = await getSupabase()
      .from('questions')
      .select(LIST_SELECT)
      .order('created_at', { ascending: false });
    if (error) toRepositoryError(error);
    return (data as unknown as QuestionRow[]).map((r) => toQuestionSummary(r, viewer));
  },

  async getQuestion(id, viewer): Promise<QuestionDetail> {
    requireAuth(viewer);
    const { data, error } = await getSupabase()
      .from('questions')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) toRepositoryError(error);
    // 존재하지 않는 경우와 권한이 없는 경우를 구분하지 않는다 (FR-021).
    if (!data) throw new UnauthorizedError();
    const r = data as unknown as QuestionRow;
    const a = r.answers?.[0] ?? null;
    return {
      ...toQuestionSummary(r, viewer),
      body: r.body ?? '',
      updatedAt: r.updated_at ?? r.created_at,
      answer:
        a && a.body
          ? {
              body: a.body,
              createdAt: a.created_at ?? r.created_at,
              updatedAt: a.updated_at ?? a.created_at ?? r.created_at,
            }
          : null,
    };
  },

  async createQuestion(input, viewer) {
    requireAuth(viewer);
    assertQuestionInput(input);
    const { data, error } = await getSupabase()
      .from('questions')
      .insert({
        author_id: viewer.userId,
        title: normalize(input.title),
        body: normalize(input.body),
      })
      .select('id')
      .single();
    if (error) toRepositoryError(error);
    return (data as { id: string }).id;
  },

  async updateQuestion(id, input, viewer) {
    requireAuth(viewer);
    assertQuestionInput(input);
    const { data, error } = await getSupabase()
      .from('questions')
      .update({ title: normalize(input.title), body: normalize(input.body) })
      .eq('id', id)
      .select('id');
    if (error) toRepositoryError(error);
    // 정책이 답변 유무까지 보므로, 0행이면 답변이 달렸거나 남의 질문이다.
    if (!data || data.length === 0) await failWithLockReason(id, viewer);
  },

  async deleteQuestion(id, viewer) {
    requireAuth(viewer);
    const { data, error } = await getSupabase()
      .from('questions')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) toRepositoryError(error);
    if (!data || data.length === 0) await failWithLockReason(id, viewer);
  },

  async upsertAnswer(questionId, body, viewer) {
    requireAuth(viewer);
    const msg = validateAnswer(body);
    if (msg) throw new ValidationError('answer', msg);
    // question_id 가 unique 이므로 upsert 가 "질문당 답변 하나"를 유지한다 (FR-016).
    const { error } = await getSupabase()
      .from('answers')
      .upsert(
        { question_id: questionId, admin_id: viewer.userId, body: normalize(body) },
        { onConflict: 'question_id' },
      );
    if (error) toRepositoryError(error);
  },
};

/** 0행의 이유를 구분한다. 답변이 있으면 잠금, 아니면 권한 없음이다. */
async function failWithLockReason(id: string, viewer: Viewer): Promise<never> {
  const detail = await supabaseRepository.getQuestion(id, viewer).catch(() => null);
  if (detail?.answer) throw new AnsweredLockError(); // FR-012
  throw new UnauthorizedError(); // FR-018
}
