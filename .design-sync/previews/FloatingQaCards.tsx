import { FloatingQaCards } from 'qanow';

/** 질문 카드 → 연결선 → 답변 카드로 흐름을 보인다.
 *  실제 질문 데이터가 아니라 흐름 설명용 예시다 — 메인은 질문 내용을 노출하지 않는다. */
export const QuestionToAnswerFlow = () => (
  <div className="surfaceDark" style={{ padding: 32, background: 'var(--ink900)', maxWidth: 560 }}>
    <FloatingQaCards />
  </div>
);
