import { type AlertColor } from "@mui/material";
import { useState, type Dispatch, type FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { SnackbarContext, type SnackbarContentType } from "../contexts/SnackbarContext";
import NotificationSnackbar from "./common/NotificationSnackbar";
import Header from "./Header";

const useSnackbarContent = (): [SnackbarContentType, Dispatch<Omit<SnackbarContentType, "timestamp">>] => {
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
  const [type, setType] = useState<AlertColor | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const setSnackbarContent = (content: Omit<SnackbarContentType, "timestamp">): void => {
    setTimestamp(content ? new Date().getTime() : undefined);
    setType(content?.type ?? undefined);
    setMessage(content?.message ?? undefined);
  };

  return [
    {
      timestamp,
      type,
      message,
    },
    setSnackbarContent,
  ];
};

const Layout: FunctionComponent = () => {
  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  return (
    <>
      <SnackbarContext.Provider value={{ snackbarContent, setSnackbarContent }}>
        <div className="flex flex-col h-screen">
          <Header />
          <div className="flex-auto overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </SnackbarContext.Provider>
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default Layout;
