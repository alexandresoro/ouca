import type * as Sentry from "@sentry/react";

// Application configuration structure
export type AppConfig = {
  apiUrl?: string;
  umami?: {
    url: string;
    id: string;
  };
  sentry?: Sentry.BrowserOptions;
};
