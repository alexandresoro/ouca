import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
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
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
  });
  return {
    SentryRoutes: Sentry.withSentryReactRouterV6Routing(RouterRoutes),
  };
};
