import { InputField } from 'qanow';

/** 라벨은 항상 필드 위에 보인다. 도움말과 글자 수가 한 줄에 나뉜다. */
export const Default = () => (
  <div style={{ maxWidth: 560 }}>
    <InputField
      label="제목"
      help="100자 이내로 입력해 주세요."
      count={{ now: 0, max: 100 }}
      placeholder="질문 제목을 입력하세요"
      readOnly
    />
  </div>
);

/** 값이 있는 상태 — 글자 수는 공백을 제거한 길이로 센다. */
export const Filled = () => (
  <div style={{ maxWidth: 560 }}>
    <InputField
      label="제목"
      help="100자 이내로 입력해 주세요."
      count={{ now: 21, max: 100 }}
      value="결제 내역은 어디에서 확인하나요?"
      readOnly
    />
  </div>
);

/** 오류 — 테두리가 바뀌고 같은 자리의 도움말이 오류 문구로 교체된다. */
export const WithError = () => (
  <div style={{ maxWidth: 560 }}>
    <InputField
      label="제목"
      help="100자 이내로 입력해 주세요."
      error="제목을 입력해 주세요."
      count={{ now: 0, max: 100 }}
      value=""
      readOnly
    />
  </div>
);
