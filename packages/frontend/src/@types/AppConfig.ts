import type * as Sentry from "@sentry/react";
import { type UserManagerSettings } from "oidc-client-ts";

// Application configuration structure
export type AppConfig = {
  apiUrl?: string;
  umami?: {
    url: string;
    id: string;
  };
  oidc: Pick<UserManagerSettings, "authority" | "client_id">;
  sentry?: Sentry.BrowserOptions;
};
