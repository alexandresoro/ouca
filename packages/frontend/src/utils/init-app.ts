import { type Routes } from "react-router-dom";
import { type AppConfig } from "../types/AppConfig";
import initializeSentry from "./sentry";

const fetchAppConfig = fetch("/appconfig", {
  method: "GET",
  credentials: "include",
  mode: "no-cors",
})
  .then((res) => res.json() as Promise<AppConfig>)
  .catch(() => {
    return {} as AppConfig;
  });

export const initApp = async (
  ReactRouterDomRoutes: typeof Routes
): Promise<{ config: AppConfig; SentryRoutes?: typeof Routes }> => {
  const config = await fetchAppConfig;

  // Sentry
  if (config.sentry) {
    const { SentryRoutes } = await initializeSentry(config.sentry, ReactRouterDomRoutes);
    return {
      config,
      SentryRoutes,
    };
  } else {
    return {
      config,
    };
  }
};
