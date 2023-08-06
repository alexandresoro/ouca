import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import RoutesManage from "./RoutesManage";
import Layout from "./components/Layout";
import LastInventory from "./components/inventory/last-inventory/LastInventory";
import UserSettingsProvider from "./contexts/UserSettingsContext";
import { lazyRoute } from "./utils/lazy-route";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <UserSettingsProvider>
        <Layout />
      </UserSettingsProvider>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/create-new" replace={true} />,
      },
      {
        path: "create-new",
        lazy: lazyRoute(() => import("./components/entry/new-entry-page/NewEntryPage")),
      },
      {
        path: "last-inventory",
        Component: LastInventory,
      },
      {
        path: "inventory/:id",
        lazy: lazyRoute(() => import("./components/inventory/inventory-page/InventoryPage")),
      },
      {
        path: "search",
        lazy: lazyRoute(() => import("./components/search/SearchPage")),
      },
      {
        path: "manage",
        Component: Outlet,
        children: [
          {
            path: "*",
            Component: RoutesManage,
          },
        ],
      },
      {
        path: "profile",
        lazy: lazyRoute(() => import("./components/user-profile/UserProfilePage")),
      },
      {
        path: "settings",
        lazy: lazyRoute(() => import("./components/SettingsPage")),
      },
      {
        path: "*",
        element: <Navigate to="/" replace={true} />,
      },
    ],
  },
  {
    path: "new-account",
    lazy: lazyRoute(() => import("./components/new-account/NewAccount")),
  },
];
