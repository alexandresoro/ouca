import type { FunctionComponent } from "react";
import { Outlet } from "react-router";
import Header from "./header/Header";
import NotificationSnackbar from "./notifications/NotificationSnackbar";

const Layout: FunctionComponent = () => {
  return (
    <>
      <div className="flex flex-col h-[100dvh]">
        <Header />
        <div id="scrollRoot" className="flex-auto overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <NotificationSnackbar />
    </>
  );
};

export default Layout;
