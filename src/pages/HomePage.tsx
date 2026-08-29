/* T021·T024 — design.md 3.1절 */
import { useNavigate } from 'react-router-dom';
import { ClosingCta, Hero } from '../components/hero/Hero';
import { FlowSteps } from '../components/hero/FlowSteps';
import { Footer } from '../components/layout/Page';
import { useAuth } from '../auth/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { isAnon } = useAuth();
  const go = (to: string) => () => navigate({ pathname: to, search: window.location.search });

  return (
    <>
      <Hero isAnon={isAnon} onWrite={go('/questions/new')} onMyQuestions={go('/questions')} />
      <FlowSteps />
      <ClosingCta onWrite={go('/questions/new')} />
      <Footer />
    </>
  );
}
