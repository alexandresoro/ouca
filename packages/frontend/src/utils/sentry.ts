import { useEffect } from "react";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType, type Routes } from "react-router-dom";
import { type AppConfig } from "../types/AppConfig";

const initializeSentry = async (
  sentryConfig: AppConfig["sentry"],
  RouterRoutes: typeof Routes
): Promise<{ SentryRoutes: typeof Routes }> => {
  const [Sentry, { BrowserTracing }] = await Promise.all([import("@sentry/react"), import("@sentry/tracing")]);

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

export default initializeSentry;
