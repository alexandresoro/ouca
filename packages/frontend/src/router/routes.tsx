import type * as Sentry from "@sentry/react";
import { Fragment } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { AuthHandler } from "../features/AuthHandler";
import ErrorBoundary from "../features/ErrorBoundary";
import Layout from "../features/Layout";
import NewAccount from "../features/new-account/NewAccount";
import LastInventory from "../features/observation/inventory/last-inventory/LastInventory";
import SessionExpired from "../features/session-expired/SessionExpired";
import UserProfilePage from "../features/user-profile/UserProfilePage";
import { lazyRoute } from "./lazy-route";
import { routesManage } from "./routes-manage";

export const routes: (SentryErrorBoundary?: typeof Sentry.ErrorBoundary) => RouteObject[] = (
  SentryErrorBoundary?: typeof Sentry.ErrorBoundary,
) => {
  const GlobalErrorBoundary = SentryErrorBoundary ?? Fragment;

  return [
    {
      path: "/",
      element: (
        <GlobalErrorBoundary fallback={<ErrorBoundary />}>
          <AuthHandler>
            <Layout />
          </AuthHandler>
        </GlobalErrorBoundary>
      ),
      errorElement: SentryErrorBoundary == null ? <ErrorBoundary /> : undefined,
      children: [
        {
          index: true,
          element: <Navigate to="/create-new" replace={true} />,
        },
        {
          path: "create-new",
          lazy: lazyRoute(() => import("../features/observation/entry/new-entry-page/NewEntryPage")),
        },
        {
          path: "last-inventory",
          Component: LastInventory,
        },
        {
          path: "inventory/:id",
          lazy: lazyRoute(() => import("../features/observation/inventory/inventory-page/InventoryPage")),
        },
        {
          path: "search",
          lazy: lazyRoute(() => import("../features/search/SearchPage")),
        },
        {
          path: "manage",
          Component: Outlet,
          children: routesManage,
        },
        {
          path: "profile",
          Component: UserProfilePage,
        },
        {
          path: "settings",
          lazy: lazyRoute(() => import("../features/settings/SettingsPage")),
        },
        {
          path: "import",
          lazy: lazyRoute(() => import("../features/import/ImportPage")),
        },
        {
          path: "*",
          element: <Navigate to="/" replace={true} />,
        },
      ],
    },
    {
      path: "new-account",
      Component: NewAccount,
    },
    {
      path: "session-expired",
      Component: SessionExpired,
    },
  ];
};
