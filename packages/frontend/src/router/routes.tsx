import * as Sentry from "@sentry/react";
import { type ComponentType } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import UserSettingsProvider from "../contexts/UserSettingsContext";
import { AuthHandler } from "../features/AuthHandler";
import Layout from "../features/Layout";
import LastInventory from "../features/observation/inventory/last-inventory/LastInventory";
import { lazyRoute } from "./lazy-route";
import { routesManage } from "./routes-manage";

export const routes: (CustomErrorBoundary?: ComponentType) => RouteObject[] = (CustomErrorBoundary?: ComponentType) => {
  return [
    {
      path: "/",
      element: (
        <AuthHandler>
          <UserSettingsProvider>
            <Layout />
          </UserSettingsProvider>
        </AuthHandler>
      ),
      ErrorBoundary: Sentry.ErrorBoundary,
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
          lazy: lazyRoute(() => import("../features/user-profile/UserProfilePage")),
        },
        {
          path: "settings",
          lazy: lazyRoute(() => import("../features/settings/SettingsPage")),
        },
        {
          path: "*",
          element: <Navigate to="/" replace={true} />,
        },
      ],
    },
    {
      path: "new-account",
      lazy: lazyRoute(() => import("../features/new-account/NewAccount")),
    },
    {
      path: "session-expired",
      lazy: lazyRoute(() => import("../features/session-expired/SessionExpired")),
    },
  ];
};
