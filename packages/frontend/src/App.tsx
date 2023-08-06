import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type UserManagerSettings } from "oidc-client-ts";
import { Suspense, useEffect, useMemo, useState, type FunctionComponent } from "react";
import { AuthProvider } from "react-oidc-context";
import { RouterProvider, type createBrowserRouter } from "react-router-dom";
import { AuthHandler } from "./components/AuthHandler";
import { AppContext, DEFAULT_CONFIG } from "./contexts/AppContext";
import { queryClient } from "./query/query-client";
import loadAnalytics from "./services/load-analytics";
import { type AppConfig } from "./types/AppConfig";

type AppProps = {
  config: AppConfig;
  router: ReturnType<typeof createBrowserRouter>;
};

const App: FunctionComponent<AppProps> = ({ config, router }) => {
  const [appContext, setAppContext] = useState<AppContext>(DEFAULT_CONFIG);

  useEffect(() => {
    setAppContext((context) => {
      return {
        ...context,
        apiUrl: config.apiUrl ?? "",
        isSentryEnabled: !!config.sentry,
      };
    });
  }, [config]);

  useEffect(() => {
    loadAnalytics(config.umami);
  }, [config]);

  const oidcConfig = useMemo(() => {
    return {
      ...config.oidc,
      redirect_uri: `${window.location.protocol}//${window.location.host}/`,
      scope: "openid email profile",
    } satisfies UserManagerSettings;
  }, [config]);

  return (
    <AppContext.Provider value={appContext}>
      <AuthProvider
        {...oidcConfig}
        onSigninCallback={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <AuthHandler>
            <div className="bg-base-100">
              <Suspense fallback="">
                <RouterProvider router={router} />
              </Suspense>
            </div>
          </AuthHandler>
        </QueryClientProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
};

export default App;
