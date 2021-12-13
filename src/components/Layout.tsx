import { AppBar, Box, Toolbar } from "@mui/material";
import { ReactElement } from "react";
import { Outlet } from "react-router-dom";

export default function Layout(): ReactElement {

  return (
    <Box sx={{
      height: "100vh"
    }}>
      <AppBar position="static">
        <Toolbar></Toolbar>
      </AppBar>
      <Box sx={{
        flex: "1 1 auto",
        overflowY: "auto"
      }}>
        <Outlet />
      </Box>
    </Box>
  )
}