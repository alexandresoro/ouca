import loadAnalytics from "@services/analytics/load-analytics";
import { apiUrlAtom } from "@services/api/useApiUrl";
import { type AppConfig } from "@services/config/config";
import { isSentryEnabledAtom } from "@services/sentry/sentry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSetAtom } from "jotai";
import { WebStorageStateStore, type UserManagerSettings } from "oidc-client-ts";
import { Suspense, useEffect, useMemo, type FunctionComponent } from "react";
import { AuthProvider } from "react-oidc-context";
import { RouterProvider, type createBrowserRouter } from "react-router-dom";

type AppProps = {
  config: AppConfig;
  router: ReturnType<typeof createBrowserRouter>;
};

const queryClient = new QueryClient();

const App: FunctionComponent<AppProps> = ({ config, router }) => {
  const setApiUrl = useSetAtom(apiUrlAtom);
  const setIsSentryEnabled = useSetAtom(isSentryEnabledAtom);

  useEffect(() => {
    setApiUrl(config.apiUrl ?? "");
    setIsSentryEnabled(!!config.sentry);
  }, [config, setApiUrl, setIsSentryEnabled]);

  useEffect(() => {
    loadAnalytics(config.umami);
  }, [config]);

  const oidcConfig = useMemo(() => {
    return {
      ...config.oidc,
      redirect_uri: `${window.location.protocol}//${window.location.host}/`,
      scope: "openid email profile offline_access",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    } satisfies UserManagerSettings;
  }, [config]);

  return (
    <AuthProvider
      {...oidcConfig}
      onSigninCallback={() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <div className="bg-base-100">
          <Suspense fallback="">
            <RouterProvider router={router} />
          </Suspense>
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
