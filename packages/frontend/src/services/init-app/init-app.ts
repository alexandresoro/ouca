import { loadAnalytics } from "@services/analytics/umami";
import { type AppConfig, initConfig } from "@services/config/config";

const fetchAppConfig = fetch("/appconfig", {
  method: "GET",
  credentials: "include",
  mode: "no-cors",
})
  .then((res) => res.json() as Promise<AppConfig>)
  .catch(() => {
    return {
      oidc: {
        authority: import.meta.env.VITE_OIDC_AUTH_URL as string,
        client_id: import.meta.env.VITE_OIDC_CLIENT_ID as string,
      },
      staticAssetsUrl: import.meta.env.VITE_ASSETS_URL as string,
      protomapsUrlPath: import.meta.env.VITE_PROTOMAPS_URL_PATH as string,
    } as AppConfig;
  });

export const initApp = async () => {
  const config = await fetchAppConfig;

  initConfig(config);

  // Umami
  if (config.umami) {
    loadAnalytics(config.umami);
  }

  // Sentry
  if (config.sentry) {
    const { initializeSentry } = await import("../sentry/sentry");
    const { sentryRouter, ErrorBoundary } = initializeSentry(config);
    return {
      sentryRouter,
      ErrorBoundary,
    };
  }

  return {};
};
