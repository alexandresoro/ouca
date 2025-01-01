import type * as Sentry from "@sentry/react";
import { Fragment } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router";
import { AuthHandler } from "../features/AuthHandler";
import ErrorBoundary from "../features/ErrorBoundary";
import Layout from "../features/Layout";
import NewAccount from "../features/new-account/NewAccount";
import NewEntryPage from "../features/observation/entry/new-entry-page/NewEntryPage";
import InventoryPage from "../features/observation/inventory/inventory-page/InventoryPage";
import LastInventory from "../features/observation/inventory/last-inventory/LastInventory";
import SearchPage from "../features/search/SearchPage";
import SessionExpired from "../features/session-expired/SessionExpired";
import SettingsPage from "../features/settings/SettingsPage";
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
          Component: NewEntryPage,
        },
        {
          path: "last-inventory",
          Component: LastInventory,
        },
        {
          path: "inventory/:id",
          Component: InventoryPage,
        },
        {
          path: "search",
          Component: SearchPage,
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
          Component: SettingsPage,
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
