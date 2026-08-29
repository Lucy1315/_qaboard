import { TextareaField } from 'qanow';

/** 여러 줄 입력. 최소 높이 240px, 글자 16px 로 모바일 자동 확대를 막는다. */
export const Default = () => (
  <div style={{ maxWidth: 560 }}>
    <TextareaField
      label="내용"
      help="5000자 이내로 입력해 주세요."
      count={{ now: 0, max: 5000 }}
      placeholder="문의하실 내용을 자세히 적어 주세요"
      readOnly
    />
  </div>
);

/** 오류 상태 — 입력값을 잃지 않고 필드 단위로 알린다. */
export const WithError = () => (
  <div style={{ maxWidth: 560 }}>
    <TextareaField
      label="내용"
      help="5000자 이내로 입력해 주세요."
      error="내용을 입력해 주세요."
      count={{ now: 0, max: 5000 }}
      value=""
      readOnly
    />
  </div>
);
