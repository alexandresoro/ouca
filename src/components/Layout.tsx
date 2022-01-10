import { Box } from "@mui/material";
import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout: FunctionComponent = () => {
  return (
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
  );
};

export default Layout;
