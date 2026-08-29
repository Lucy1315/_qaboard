/* T026·T041 — contracts/repository.md. 데이터 접근의 유일한 통로이다.
   페이지가 저장소 구현을 직접 부르지 않는다. */
import type { QuestionDetail, QuestionInput, QuestionSummary, Viewer } from './types';
import { isMock } from '../lib/env';
import { mockRepository } from './mockRepository';
import { supabaseRepository } from './supabaseRepository';

export interface QuestionRepository {
  listQuestions(viewer: Viewer): Promise<QuestionSummary[]>;
  getQuestion(id: string, viewer: Viewer): Promise<QuestionDetail>;
  createQuestion(input: QuestionInput, viewer: Viewer): Promise<string>;
  updateQuestion(id: string, input: QuestionInput, viewer: Viewer): Promise<void>;
  deleteQuestion(id: string, viewer: Viewer): Promise<void>;
  upsertAnswer(questionId: string, body: string, viewer: Viewer): Promise<void>;
}

export const repository: QuestionRepository = isMock ? mockRepository : supabaseRepository;
