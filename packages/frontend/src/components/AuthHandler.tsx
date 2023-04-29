import { useEffect, type ReactElement } from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";

export const AuthHandler = ({ children }: { children: ReactElement }): ReactElement => {
  const auth = useAuth();

  useEffect(() => {
    // rome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading) {
      void auth.signinRedirect();
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
  }, [auth.isAuthenticated, auth.activeNavigator, auth.isLoading, auth.signinRedirect, auth]);

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
