// import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error tracking.
 * Call this at the top level of your app (e.g., _app.tsx or middleware).
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('Sentry initialization requested but @sentry/nextjs is not installed.');
    /*
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
    */
  }
}

/**
 * Log an error to Sentry.
 * @param {Error} error
 * @param {object} [context]
 */
export function logErrorToSentry(error: Error, context?: Record<string, any>) {
  console.error('Error (simulated Sentry log):', error, context);
  // Sentry.captureException(error, { extra: context });
}
