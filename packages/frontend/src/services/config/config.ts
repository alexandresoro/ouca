import type * as Sentry from "@sentry/react";
import { type UmamiConfig } from "@services/analytics/umami";
import { atom, getDefaultStore } from "jotai";
import { type UserManagerSettings } from "oidc-client-ts";

// Application configuration structure
export type AppConfig = {
  apiUrl?: string;
  umami?: UmamiConfig;
  oidc: Pick<UserManagerSettings, "authority" | "client_id">;
  sentry?: Sentry.BrowserOptions;
};

export const configAtom = atom<AppConfig>(null as unknown as AppConfig);

export const initConfig = (config: AppConfig) => {
  const defaultStore = getDefaultStore();
  defaultStore.set(configAtom, config);
};
