import { useApiMe } from "@services/api/me/api-me-queries";
import { isSentryEnabledAtom } from "@services/sentry/sentry-atom";
import { useAtomValue } from "jotai";
import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { hasAuthParams, useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

export const AuthHandler = ({ children }: { children: ReactElement }): ReactElement => {
  const { t } = useTranslation();
  const auth = useAuth();

  // Used to check if the user exists.
  // In case the user doesn't exist, we redirect to the new account page
  // This is needed to handle cases where a valid user without account reaches any page instead of the new account page
  const { isLoading } = useApiMe();

  const navigate = useNavigate();

  const isSentryEnabled = useAtomValue(isSentryEnabledAtom);

  useEffect(() => {
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading) {
      void auth.clearStaleState();
      void auth.signinRedirect();
    }
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

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] justify-center items-center">
        <div className="flex flex-col gap-2 items-center">
          <span className="text-xl text-primary">{t("loading.settingsOngoing")}</span>
          <span className="loading loading-lg loading-ring text-primary" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
