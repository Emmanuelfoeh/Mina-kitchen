import * as Sentry from '@sentry/nextjs';

// Server (Node.js runtime) Sentry initialization. No-ops when SENTRY_DSN is
// unset, so local/dev and unconfigured environments are unaffected.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN && process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});
