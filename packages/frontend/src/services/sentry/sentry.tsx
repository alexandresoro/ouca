import { ExtraErrorData, HttpClient } from "@sentry/integrations";
import * as Sentry from "@sentry/react";
import { type AppConfig } from "@services/config/config";
import { type User } from "oidc-client-ts";
import { useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

// This will bundle the whole sentry package
// Take care to dynamically load this entry so that it can be lazy loaded

export const initializeSentry = (config: AppConfig) => {
  const { sentry, apiUrl } = config;
  Sentry.init({
    ...sentry,
    ...(apiUrl
      ? {
          tracePropagationTargets: [apiUrl],
        }
      : {}),
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      // Disable replay as not supported by GlitchTip
      // new Sentry.Replay({}),
      new ExtraErrorData(),
      new HttpClient(),
    ],
    beforeSend(event) {
      // Check if it is an exception, and if so, show the report dialog

      // Ignore exceptions for which the stacktrace includes references to analytics
      const shouldErrorBeIgnored =
        config.umami?.url != null &&
        event.exception?.values?.[0].stacktrace?.frames?.find(({ filename }) => {
          return filename === config.umami?.url;
        }) != null;
      if (shouldErrorBeIgnored) {
        return null;
      }

      if (event.exception) {
        Sentry.showReportDialog({
          eventId: event.event_id,
          user: { name: event.user?.username, email: event.user?.email },
        });
      }
      return event;
    },
  });
  return {
    sentryRouter: Sentry.wrapCreateBrowserRouter(createBrowserRouter),
    ErrorBoundary: Sentry.ErrorBoundary,
  };
};

export const setUser = (user: User | null | undefined): void => {
  Sentry.setUser(
    user
      ? {
          id: user.profile.sub,
          username: user.profile.name,
          email: user.profile.email,
        }
      : null
  );
};
