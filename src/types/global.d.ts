export {};

declare global {
  interface Window {
    HSComboBox?: {
      autoInit?: () => void;
    };
  }

  interface ImportMetaEnv {
    readonly NG_APP_BACKEND_BASE_URI: string;
    readonly NG_APP_BACKEND_BASE_URI_SSR: string;
    readonly NG_APP_POSTHOG_KEY: string;
    readonly NG_APP_POSTHOG_HOST: string;
    readonly NG_APP_SENTRY_DSN: string;
    readonly NG_APP_SENTRY_TRACE_SAMPLE_RATE: string;
    readonly NG_APP_SENTRY_PROFILE_SAMPLE_RATE: string;
    readonly NG_APP_SENTRY_ENVIRONMENT: string;
    readonly NG_APP_SENTRY_RELEASE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
