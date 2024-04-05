import { useDisplayNotification } from "@hooks/useNotifications";
import type { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { SnackbarContext } from "../contexts/SnackbarContext";
import Header from "./header/Header";
import NotificationSnackbar from "./notifications/NotificationSnackbar";

const Layout: FunctionComponent = () => {
  const displayNotification = useDisplayNotification();

  return (
    <>
      <SnackbarContext.Provider value={{ displayNotification }}>
        <div className="flex flex-col h-[100dvh]">
          <Header />
          <div id="scrollRoot" className="flex-auto overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </SnackbarContext.Provider>
      <NotificationSnackbar />
    </>
  );
};

export default Layout;
