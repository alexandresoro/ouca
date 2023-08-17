import { useEffect, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { hasAuthParams, useAuth } from "react-oidc-context";
import useAppContext from "../hooks/useAppContext";

export const AuthHandler = ({ children }: { children: ReactElement }): ReactElement => {
  const { t } = useTranslation();
  const auth = useAuth();

  const appContext = useAppContext();

  useEffect(() => {
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading) {
      void auth.signinRedirect();
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
  }, [auth.isAuthenticated, auth.activeNavigator, auth.isLoading, auth.signinRedirect, auth]);

  useEffect(() => {
    if (appContext.isSentryEnabled) {
      void import("../utils/sentry").then(({ setUser }) => {
        setUser(auth.user);
      });
    }
  }, [auth, appContext]);

  if (auth.activeNavigator) {
    return (
      <div className="flex h-[100dvh] justify-center items-center">
        <div className="flex flex-col gap-2 items-center">
          <span className="text-xl text-primary">{t("loading.loadingOngoing")}</span>
          <span className="loading loading-lg loading-ring text-primary" />
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <></>;
  }

  return <>{children}</>;
};
