import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/base.css';
import './styles/motion.css';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { missingEnv } from './lib/env';

const missing = missingEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {missing.length > 0 ? (
      <main style={{ maxWidth: 720, margin: '80px auto', padding: 24, fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: 20 }}>환경 변수가 비어 있습니다.</h1>
        <p>다음 변수에 값을 채운 뒤 다시 실행해 주세요: {missing.join(', ')}</p>
      </main>
    ) : (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
);
