import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../components/layout/Page';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Page prose>
      <PageHeader title="페이지를 찾을 수 없습니다." desc="주소를 다시 확인해 주세요." stacked />
      <div style={{ marginTop: 24 }}>
        <Button variant="secondary" onClick={() => navigate('/')}>
          메인으로 이동
        </Button>
      </div>
    </Page>
  );
}
