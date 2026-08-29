/* T027 — Mock 구현. contracts/repository.md 의 동치 조건 7항목을 Supabase 구현과 동일하게 지킨다.
   권한 규칙을 그대로 재현해야 데이터 연결 전에 UI 분기를 검증할 수 있다. */
import type { QuestionRepository } from './repository';
import type { QuestionDetail, QuestionInput, QuestionSummary, Viewer } from './types';
import { mockQuestions, type MockQuestion } from './fixtures';
import {
  AnsweredLockError,
  AuthRequiredError,
  RepositoryError,
  UnauthorizedError,
  ValidationError,
} from './errors';
import { normalize, validateAnswer, validateBody, validateTitle } from './validation';

let store: MockQuestion[] = mockQuestions.map((q) => ({ ...q }));

/** 프로토타입 확인용 스위치. Mock 모드에서만 의미가 있다. */
function flags() {
  if (typeof window === 'undefined') return { fail: false, empty: false };
  const p = new URLSearchParams(window.location.search);
  return { fail: p.get('fail') === '1', empty: p.get('empty') === '1' };
}

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

function requireAuth(viewer: Viewer): asserts viewer is Extract<Viewer, { role: 'member' | 'admin' }> {
  if (viewer.role === 'anon') throw new AuthRequiredError();
}

function toSummary(q: MockQuestion, viewer: Viewer): QuestionSummary {
  return {
    id: q.id,
    title: q.title,
    createdAt: q.createdAt,
    status: q.answer ? 'done' : 'wait',
    authorEmail: viewer.role === 'admin' ? q.authorEmail : undefined,
  };
}

/** 조회 가능 여부 — RLS P5 와 같은 조건이다 (FR-009·FR-018·FR-021) */
function canRead(q: MockQuestion, viewer: Viewer): boolean {
  if (viewer.role === 'anon') return false;
  return viewer.role === 'admin' || q.authorEmail === viewer.email;
}

export const mockRepository: QuestionRepository = {
  async listQuestions(viewer) {
    await delay();
    requireAuth(viewer);
    const { fail, empty } = flags();
    if (fail) throw new RepositoryError();
    if (empty) return [];
    return store
      .filter((q) => canRead(q, viewer))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((q) => toSummary(q, viewer));
  },

  async getQuestion(id, viewer): Promise<QuestionDetail> {
    await delay();
    requireAuth(viewer);
    if (flags().fail) throw new RepositoryError();
    const q = store.find((x) => x.id === id);
    // 존재하지 않는 경우와 권한이 없는 경우를 구분하지 않는다 (FR-021)
    if (!q || !canRead(q, viewer)) throw new UnauthorizedError();
    return {
      ...toSummary(q, viewer),
      body: q.body,
      updatedAt: q.updatedAt,
      answer: q.answer,
    };
  },

  async createQuestion(input, viewer) {
    await delay(400);
    requireAuth(viewer);
    // 관리자는 질문을 작성하지 않는다 (FR-005)
    if (viewer.role === 'admin') throw new UnauthorizedError();
    assertQuestionInput(input);
    const now = new Date().toISOString();
    const id = `q${Date.now()}`;
    store = [
      {
        id,
        authorEmail: viewer.email,
        title: normalize(input.title),
        body: normalize(input.body),
        createdAt: now,
        updatedAt: now,
        answer: null,
      },
      ...store,
    ];
    return id;
  },

  async updateQuestion(id, input, viewer) {
    await delay(400);
    requireAuth(viewer);
    const q = store.find((x) => x.id === id);
    if (!q || q.authorEmail !== viewer.email) throw new UnauthorizedError();
    if (q.answer) throw new AnsweredLockError(); // FR-012
    assertQuestionInput(input);
    q.title = normalize(input.title);
    q.body = normalize(input.body);
    q.updatedAt = new Date().toISOString();
  },

  async deleteQuestion(id, viewer) {
    await delay(400);
    requireAuth(viewer);
    const q = store.find((x) => x.id === id);
    if (!q || q.authorEmail !== viewer.email) throw new UnauthorizedError();
    if (q.answer) throw new AnsweredLockError(); // FR-012
    store = store.filter((x) => x.id !== id); // FR-013
  },

  async upsertAnswer(questionId, body, viewer) {
    await delay(400);
    requireAuth(viewer);
    if (viewer.role !== 'admin') throw new UnauthorizedError(); // FR-017
    const q = store.find((x) => x.id === questionId);
    if (!q) throw new UnauthorizedError();
    const msg = validateAnswer(body);
    if (msg) throw new ValidationError('answer', msg);
    const now = new Date().toISOString();
    // 질문당 답변은 하나만 유지한다 (FR-016)
    q.answer = q.answer
      ? { ...q.answer, body: normalize(body), updatedAt: now }
      : { body: normalize(body), createdAt: now, updatedAt: now };
  },
};

/** 저장 직전 다시 검증한다 — 폼을 거치지 않은 호출도 막는다 (FR-027) */
function assertQuestionInput(input: QuestionInput): void {
  const t = validateTitle(input.title);
  if (t) throw new ValidationError('title', t);
  const b = validateBody(input.body);
  if (b) throw new ValidationError('body', b);
}

/** 테스트에서 저장소를 초기 상태로 되돌린다. */
export function __resetMockStore(): void {
  store = mockQuestions.map((q) => ({ ...q }));
}
