import { useEffect, type ReactElement } from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";
import useAppContext from "../hooks/useAppContext";

export const AuthHandler = ({ children }: { children: ReactElement }): ReactElement => {
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
      <div>
        <progress className="progress progress-primary w-56"></progress>
      </div>
    );
  }
  if (!auth.isAuthenticated) {
    return <></>;
  }

  return <>{children}</>;
};
