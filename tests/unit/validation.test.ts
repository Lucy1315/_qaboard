/* T062 — FR-023~FR-025, SC-006. 경계값 0·1·최대·최대+1·공백만 × 제목/내용/답변 = 15케이스 */
import { describe, expect, it } from 'vitest';
import {
  LIMITS,
  countOf,
  normalize,
  validateAnswer,
  validateBody,
  validateTitle,
} from '../../src/data/validation';

const cases = [
  { name: '제목', fn: validateTitle, max: LIMITS.title, emptyMsg: '제목을 입력해 주세요.' },
  { name: '내용', fn: validateBody, max: LIMITS.body, emptyMsg: '내용을 입력해 주세요.' },
  { name: '답변', fn: validateAnswer, max: LIMITS.answer, emptyMsg: '답변을 입력해 주세요.' },
] as const;

describe.each(cases)('$name 경계값 (FR-023~025)', ({ fn, max, emptyMsg }) => {
  it('0자 → 실패', () => expect(fn('')).toBe(emptyMsg));
  it('1자 → 통과', () => expect(fn('가')).toBeNull());
  it('최대치 → 통과', () => expect(fn('가'.repeat(max))).toBeNull());
  it('최대치+1 → 실패', () => expect(fn('가'.repeat(max + 1))).toContain('넘을 수 없습니다'));
  it('공백만 → 빈 입력으로 취급 (FR-026)', () => expect(fn('   \n\t  ')).toBe(emptyMsg));
});

describe('normalize / countOf', () => {
  it('앞뒤 공백을 제거한다', () => expect(normalize('  가나  ')).toBe('가나'));
  it('글자 수는 공백 제거 후 길이이다', () => expect(countOf('  가나다  ')).toBe(3));
});
