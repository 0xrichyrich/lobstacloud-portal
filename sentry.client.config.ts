import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment and release tracking
  environment: process.env.NODE_ENV || "development",
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay for debugging user issues
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\.redlobsta\.cloud/,
    /^https:\/\/lobstacloud-api\.vercel\.app/,
  ],

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",
});
