import { Suspense, lazy, type FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { SnackbarContext } from "../contexts/SnackbarContext";
import { useNotifications } from "../hooks/useNotifications";

const Header = lazy(() => import("./header/Header"));
const NotificationSnackbar = lazy(() => import("./notifications/NotificationSnackbar"));

const Layout: FunctionComponent = () => {
  const [notifications, displayNotification] = useNotifications();

  return (
    <Suspense fallback={<></>}>
      <SnackbarContext.Provider value={{ displayNotification }}>
        <div className="flex flex-col h-[100dvh]">
          <Header />
          <div className="flex-auto overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </SnackbarContext.Provider>
      <NotificationSnackbar notifications={notifications} />
    </Suspense>
  );
};

export default Layout;
