import { Box } from "@mui/material";
import { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout(): ReactElement {
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
}
