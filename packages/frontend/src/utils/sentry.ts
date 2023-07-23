import { ExtraErrorData, HttpClient } from "@sentry/integrations";
import * as Sentry from "@sentry/react";
import { type User } from "oidc-client-ts";
import { useEffect } from "react";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType, type Routes } from "react-router-dom";
import { type AppConfig } from "../types/AppConfig";

export const initializeSentry = (
  sentryConfig: AppConfig["sentry"],
  RouterRoutes: typeof Routes
): { SentryRoutes: typeof Routes } => {
  Sentry.init({
    ...sentryConfig,
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
      //new Sentry.Replay(),
      new ExtraErrorData(),
      new HttpClient(),
    ],
    beforeSend(event) {
      // Check if it is an exception, and if so, show the report dialog
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
    SentryRoutes: Sentry.withSentryReactRouterV6Routing(RouterRoutes),
  };
};

export const setUser = (user: User | null | undefined): void => {
  Sentry.setUser(
    user
      ? {
          id: user.profile.sub,
          username: user.profile.preferred_username,
        }
      : null
  );
};
