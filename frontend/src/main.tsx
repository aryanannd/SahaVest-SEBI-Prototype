import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/layout/ErrorBoundary.tsx';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && !sentryDsn.includes('your_sentry_dsn')) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE || 'development',
      sendDefaultPii: false,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Strip sensitive user fields from breadcrumbs and exception contexts
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
  } catch (err) {
    console.warn('[Sentry Frontend] Initialization notice:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
