import { isSentryEnabledAtom } from "@services/sentry/sentry-atom";
import { useAtomValue } from "jotai";
import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { hasAuthParams, useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

export const AuthHandler = ({ children }: { children: ReactElement }): ReactElement => {
  const { t } = useTranslation();
  const auth = useAuth();

  const navigate = useNavigate();

  const isSentryEnabled = useAtomValue(isSentryEnabledAtom);

  useEffect(() => {
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading) {
      void auth.clearStaleState();
      void auth.signinRedirect();
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
  }, [auth.isAuthenticated, auth.activeNavigator, auth.isLoading, auth.signinRedirect, auth]);

  useEffect(() => {
    // Redirect to expiration page whenever the current token has expired
    return auth.events.addAccessTokenExpired(() => {
      navigate("/session-expired", { replace: true });
    });
  }, [auth.events, navigate]);

  useEffect(() => {
    if (isSentryEnabled) {
      void import("../services/sentry/sentry").then(({ setUser }) => {
        setUser(auth.user);
      });
    }
  }, [auth, isSentryEnabled]);

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
