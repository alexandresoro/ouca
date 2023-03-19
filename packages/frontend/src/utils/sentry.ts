import { ExtraErrorData, HttpClient } from "@sentry/integrations";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { useEffect } from "react";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType, type Routes } from "react-router-dom";
import { type UserInfo } from "..//gql/graphql";
import { type AppConfig } from "../types/AppConfig";

export const initializeSentry = (
  sentryConfig: AppConfig["sentry"],
  RouterRoutes: typeof Routes
): { SentryRoutes: typeof Routes } => {
  Sentry.init({
    ...sentryConfig,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay(),
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

export const setUser = (userInfo: UserInfo | null): void => {
  Sentry.setUser(
    userInfo
      ? {
          id: userInfo.id,
          username: userInfo.username,
        }
      : null
  );
};
