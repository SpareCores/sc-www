export {};

declare global {
  interface ImportMetaEnv {
    NG_APP_BACKEND_BASE_URI?: string;
    NG_APP_BACKEND_BASE_URI_SSR?: string;
    NG_APP_POSTHOG_HOST?: string;
    NG_APP_POSTHOG_KEY?: string;
    NG_APP_SENTRY_DSN?: string;
    NG_APP_SENTRY_TRACE_SAMPLE_RATE?: string;
    NG_APP_SENTRY_PROFILE_SAMPLE_RATE?: string;
    NG_APP_SENTRY_ENVIRONMENT?: string;
    NG_APP_SENTRY_RELEASE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    HSComboBox?: {
      autoInit?: () => void;
    };
  }
}
