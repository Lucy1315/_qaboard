/* T025 — data-model.md 5절 */
export type Role = 'member' | 'admin';

/** 표시 문구: wait = 답변 대기, done = 답변 완료 (FR-006) */
export type QuestionStatus = 'wait' | 'done';

export type Viewer =
  | { role: 'anon' }
  | { role: Role; userId: string; email: string };

export type QuestionSummary = {
  id: string;
  title: string;
  createdAt: string;
  /** 관리자에게만 채워진다 (FR-008) */
  authorEmail?: string;
  status: QuestionStatus;
};

export type QuestionDetail = QuestionSummary & {
  body: string;
  updatedAt: string;
  answer: { body: string; createdAt: string; updatedAt: string } | null;
};

export type QuestionInput = { title: string; body: string };
