import { AlertColor, Box } from "@mui/material";
import { Dispatch, FunctionComponent, useState } from "react";
import { Outlet } from "react-router-dom";
import { SnackbarContentType, SnackbarContext } from "../contexts/SnackbarContext";
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
      message
    },
    setSnackbarContent
  ];
};

const Layout: FunctionComponent = () => {
  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  return (
    <>
      <SnackbarContext.Provider value={{ snackbarContent, setSnackbarContent }}>
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Header />
          <Box
            sx={{
              flex: "1 1 auto",
              overflowY: "auto"
            }}
          >
            <Outlet />
          </Box>
        </Box>
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
