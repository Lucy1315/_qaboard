/* T027 검증 — contracts/repository.md 동치 조건 7항목 */
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetMockStore, mockRepository as repo } from '../../src/data/mockRepository';
import { MOCK_ME } from '../../src/data/fixtures';
import {
  AnsweredLockError,
  AuthRequiredError,
  UnauthorizedError,
  ValidationError,
} from '../../src/data/errors';
import type { Viewer } from '../../src/data/types';

const anon: Viewer = { role: 'anon' };
const me: Viewer = { role: 'member', userId: 'm1', email: MOCK_ME };
const other: Viewer = { role: 'member', userId: 'm2', email: 'minho@example.com' };
const admin: Viewer = { role: 'admin', userId: 'a1', email: 'admin@qanow.kr' };

beforeEach(__resetMockStore);

describe('권한 경계 (FR-007·008·009·017·018)', () => {
  it('1. 회원은 자기 질문만 목록에 나온다', async () => {
    const items = await repo.listQuestions(me);
    expect(items.length).toBe(2);
    expect(items.every((i) => i.authorEmail === undefined)).toBe(true);
  });

  it('2. 관리자는 전체 질문이 나오고 작성자 이메일이 채워진다', async () => {
    const items = await repo.listQuestions(admin);
    expect(items.length).toBe(4);
    expect(items.every((i) => typeof i.authorEmail === 'string')).toBe(true);
  });

  it('3. 타인 질문 조회는 거부된다', async () => {
    await expect(repo.getQuestion('q1', other)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('3b. 존재하지 않는 질문도 같은 오류를 낸다 (FR-021)', async () => {
    await expect(repo.getQuestion('nope', me)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('5. 회원은 답변을 작성할 수 없다 (FR-017)', async () => {
    await expect(repo.upsertAnswer('q1', '답변입니다', me)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('비회원은 인증 오류를 받는다 (FR-020)', async () => {
    await expect(repo.listQuestions(anon)).rejects.toBeInstanceOf(AuthRequiredError);
  });

  it('관리자는 질문을 작성할 수 없다 (FR-005)', async () => {
    await expect(
      repo.createQuestion({ title: '제목', body: '내용' }, admin),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe('답변 전후 잠금 (FR-010·011·012)', () => {
  it('4. 답변 있는 질문은 수정할 수 없다', async () => {
    await expect(
      repo.updateQuestion('q3', { title: '새 제목', body: '새 내용' }, me),
    ).rejects.toBeInstanceOf(AnsweredLockError);
  });

  it('4b. 답변 있는 질문은 삭제할 수 없다', async () => {
    await expect(repo.deleteQuestion('q3', me)).rejects.toBeInstanceOf(AnsweredLockError);
  });

  it('답변 전 질문은 수정·삭제할 수 있다', async () => {
    await repo.updateQuestion('q1', { title: '고친 제목', body: '고친 내용' }, me);
    const q = await repo.getQuestion('q1', me);
    expect(q.title).toBe('고친 제목');
    await repo.deleteQuestion('q1', me);
    await expect(repo.getQuestion('q1', me)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe('저장 직전 재검증 (FR-027) / 단일 답변 (FR-016)', () => {
  it('6. 폼을 거치지 않아도 검증이 적용된다', async () => {
    await expect(repo.createQuestion({ title: '   ', body: '내용' }, me)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('7. 답변을 두 번 등록해도 하나만 유지된다', async () => {
    await repo.upsertAnswer('q1', '첫 답변', admin);
    await repo.upsertAnswer('q1', '고친 답변', admin);
    const q = await repo.getQuestion('q1', admin);
    expect(q.answer?.body).toBe('고친 답변');
    expect(q.status).toBe('done');
  });
});
