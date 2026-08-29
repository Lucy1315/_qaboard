/* T064 — 역할별 UI 존재·부재 / 배지 텍스트 병기 (FR-012·FR-017·FR-030) */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/ui/Badge';
import { StateBox } from '../../src/components/ui/StateBox';
import { QuestionDetailView } from '../../src/components/question/QuestionDetailView';
import type { QuestionDetail } from '../../src/data/types';

const base: QuestionDetail = {
  id: 'q1',
  title: '결제 내역은 어디에서 확인하나요?',
  body: '본문입니다.',
  createdAt: '2026-08-29T14:02:00+09:00',
  updatedAt: '2026-08-29T14:02:00+09:00',
  status: 'wait',
  answer: null,
};
const answered: QuestionDetail = {
  ...base,
  status: 'done',
  answer: { body: '답변입니다.', createdAt: base.createdAt, updatedAt: base.createdAt },
};
const noop = vi.fn();

function view(q: QuestionDetail, role: 'member' | 'admin') {
  return render(
    <QuestionDetailView
      q={q}
      isMember={role === 'member'}
      isAdmin={role === 'admin'}
      onEdit={noop}
      onDelete={noop}
      onAnswer={noop}
    />,
  );
}

describe('Badge (FR-030)', () => {
  it('배지는 항상 텍스트를 함께 표시한다', () => {
    render(<Badge tone="wait">답변 대기</Badge>);
    expect(screen.getByText('답변 대기')).toBeInTheDocument();
  });
});

describe('StateBox (FR-029·FR-032)', () => {
  it.each([
    ['loginRequired', '로그인이 필요한 화면입니다.'],
    ['unauthorized', '이 질문에 접근할 권한이 없습니다.'],
    ['errorList', '목록을 불러오지 못했습니다.'],
    ['emptyMember', '아직 남긴 질문이 없습니다.'],
    ['emptyAdmin', '등록된 질문이 없습니다.'],
  ] as const)('%s 상태를 텍스트로 표시한다', (variant, text) => {
    render(<StateBox variant={variant} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe('역할별 행동 영역 (design.md 13.1절)', () => {
  it('회원 · 답변 전 → 수정·삭제 버튼이 있다', () => {
    view(base, 'member');
    expect(screen.getByRole('button', { name: '수정하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제하기' })).toBeInTheDocument();
  });

  it('회원 · 답변 후 → 수정·삭제 버튼이 없고 안내가 나온다 (FR-012)', () => {
    view(answered, 'member');
    expect(screen.queryByRole('button', { name: '수정하기' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '삭제하기' })).not.toBeInTheDocument();
    expect(
      screen.getByText('답변이 등록된 질문은 수정하거나 삭제할 수 없습니다.'),
    ).toBeInTheDocument();
  });

  it('회원 화면에는 답변 입력 요소가 존재하지 않는다 (FR-017)', () => {
    view(base, 'member');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /답변/ })).not.toBeInTheDocument();
  });

  it('관리자 · 답변 전 → 답변 작성하기', () => {
    view(base, 'admin');
    expect(screen.getByRole('button', { name: '답변 작성하기' })).toBeInTheDocument();
  });

  it('관리자 · 답변 후 → 답변 수정하기', () => {
    view(answered, 'admin');
    expect(screen.getByRole('button', { name: '답변 수정하기' })).toBeInTheDocument();
  });

  it('답변이 없으면 대기 안내를 표시한다 (FR-006)', () => {
    view(base, 'member');
    expect(
      screen.getByText('아직 답변이 등록되지 않았습니다. 관리자가 확인 후 등록합니다.'),
    ).toBeInTheDocument();
  });
});

describe('StatusTabs (FR-041 / design.md 11.1절)', () => {
  const counts = { all: 4, wait: 2, done: 2 };

  it('세 구분과 건수를 표시한다', async () => {
    const { StatusTabs } = await import('../../src/components/ui/StatusTabs');
    render(<StatusTabs value="all" counts={counts} enabled onChange={noop} />);
    for (const label of ['전체', '답변 대기', '답변 완료']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /답변 대기\s*2/ })).toBeInTheDocument();
  });

  it('데이터가 없으면 건수를 감추고 탭을 비활성화한다', async () => {
    const { StatusTabs } = await import('../../src/components/ui/StatusTabs');
    render(<StatusTabs value="all" counts={null} enabled={false} onChange={noop} />);
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    for (const b of screen.getAllByRole('button')) expect(b).toBeDisabled();
  });

  it('건수가 0인 구분은 비활성화한다', async () => {
    const { StatusTabs } = await import('../../src/components/ui/StatusTabs');
    render(<StatusTabs value="all" counts={{ all: 2, wait: 0, done: 2 }} enabled onChange={noop} />);
    expect(screen.getByRole('button', { name: /답변 대기/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /답변 완료/ })).toBeEnabled();
  });
});
