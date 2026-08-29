/* T025 — 입력 검증의 단일 출처 (FR-023~FR-027, design.md 12절).
   이 파일 밖에서 길이 규칙을 다시 정의하지 않는다. */
export const LIMITS = { title: 100, body: 5000, answer: 5000 } as const;

/** 앞뒤 공백만 있는 입력은 빈 입력으로 취급한다 (FR-026) */
export const normalize = (s: string): string => s.trim();

export const HELP = {
  title: `${LIMITS.title}자 이내로 입력해 주세요.`,
  body: `${LIMITS.body}자 이내로 입력해 주세요.`,
  answer: `${LIMITS.answer}자 이내로 입력해 주세요.`,
} as const;

function check(raw: string, max: number, emptyMsg: string, overMsg: string): string | null {
  const v = normalize(raw);
  if (v.length === 0) return emptyMsg;
  if (v.length > max) return overMsg;
  return null;
}

/** 통과하면 null, 실패하면 사용자에게 보여줄 문구를 돌려준다. */
export const validateTitle = (raw: string): string | null =>
  check(raw, LIMITS.title, '제목을 입력해 주세요.', `제목은 ${LIMITS.title}자를 넘을 수 없습니다.`);

export const validateBody = (raw: string): string | null =>
  check(raw, LIMITS.body, '내용을 입력해 주세요.', `내용은 ${LIMITS.body}자를 넘을 수 없습니다.`);

export const validateAnswer = (raw: string): string | null =>
  check(raw, LIMITS.answer, '답변을 입력해 주세요.', `답변은 ${LIMITS.answer}자를 넘을 수 없습니다.`);

/** 글자 수 표기는 공백을 제거한 길이를 쓴다(검증 기준과 일치시키기 위함이다). */
export const countOf = (raw: string): number => normalize(raw).length;
