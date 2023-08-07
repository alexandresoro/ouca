import { type AppConfig } from "../types/AppConfig";

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
    } as AppConfig;
  });

export const initApp = async () => {
  const config = await fetchAppConfig;

  // Sentry
  if (config.sentry) {
    const { initializeSentry } = await import("./sentry");
    const { sentryRouter } = initializeSentry(config);
    return {
      config,
      sentryRouter,
    };
  } else {
    return {
      config,
    };
  }
};
