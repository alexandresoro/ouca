/// <reference types="vite/client" />
import { ApolloClient, InMemoryCache } from "@apollo/client";
import "@fontsource/lato";
import "@fontsource/yuji-hentaigana-akebono";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { AppConfig } from "./types/AppConfig";
import wrapPromise from "./utils/wrapPromise";

// Retrieve app config as early as possible
const appConfigFetch = fetch("/appconfig")
  .then((res) => res.json() as Promise<AppConfig>)
  .catch(() => {
    return {} as AppConfig;
  });

// Sentry integration
appConfigFetch
  .then((config) => {
    if (config?.sentry) {
      Sentry.init({
        ...config.sentry,
        integrations: [
          new BrowserTracing({
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              React.useEffect,
              useLocation,
              useNavigationType,
              createRoutesFromChildren,
              matchRoutes
            ),
          }),
        ],
      });
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .catch(() => {});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<></>}>
      <App apolloClient={apolloClient} appConfigWrapped={wrapPromise(appConfigFetch)} />
    </Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
