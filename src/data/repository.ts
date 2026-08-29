/* T026 — contracts/repository.md. 데이터 접근의 유일한 통로이다.
   페이지가 저장소 구현을 직접 부르지 않는다. */
import type { QuestionDetail, QuestionInput, QuestionSummary, Viewer } from './types';
import { mockRepository } from './mockRepository';

export interface QuestionRepository {
  listQuestions(viewer: Viewer): Promise<QuestionSummary[]>;
  getQuestion(id: string, viewer: Viewer): Promise<QuestionDetail>;
  createQuestion(input: QuestionInput, viewer: Viewer): Promise<string>;
  updateQuestion(id: string, input: QuestionInput, viewer: Viewer): Promise<void>;
  deleteQuestion(id: string, viewer: Viewer): Promise<void>;
  upsertAnswer(questionId: string, body: string, viewer: Viewer): Promise<void>;
}

/* Phase 5 에서 supabaseRepository 를 추가한다. 지금은 Mock 만 존재한다. */
export const repository: QuestionRepository = mockRepository;
