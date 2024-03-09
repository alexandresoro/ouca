import { useDisplayNotification } from "@hooks/useNotifications";
import { type FunctionComponent, Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { SnackbarContext } from "../contexts/SnackbarContext";

const Header = lazy(() => import("./header/Header"));
const NotificationSnackbar = lazy(() => import("./notifications/NotificationSnackbar"));

const Layout: FunctionComponent = () => {
  const displayNotification = useDisplayNotification();

  return (
    // biome-ignore lint/complexity/noUselessFragments: <explanation>
    <Suspense fallback={<></>}>
      <SnackbarContext.Provider value={{ displayNotification }}>
        <div className="flex flex-col h-[100dvh]">
          <Header />
          <div id="scrollRoot" className="flex-auto overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </SnackbarContext.Provider>
      <NotificationSnackbar />
    </Suspense>
  );
};

export default Layout;
