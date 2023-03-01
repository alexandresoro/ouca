import { type FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { SnackbarContext } from "../contexts/SnackbarContext";
import { useNotifications } from "../hooks/useNotifications";
import Header from "./Header";
import NotificationSnackbar from "./notifications/NotificationSnackbar";

const Layout: FunctionComponent = () => {
  const [notifications, displayNotification] = useNotifications();

  return (
    <>
      <SnackbarContext.Provider value={{ displayNotification }}>
        <div className="flex flex-col h-[100dvh]">
          <Header />
          <div className="flex-auto overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </SnackbarContext.Provider>
      <NotificationSnackbar notifications={notifications} />
    </>
  );
};

export default Layout;
