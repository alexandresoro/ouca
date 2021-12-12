import { AppBar, Toolbar } from "@mui/material";
import { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout(): ReactElement {

  const location = useLocation();
  const shouldDisplayHeader = (location?.pathname !== "/login");

  return (
    <>
      {
        shouldDisplayHeader && (
          <AppBar position="static">
            <Toolbar></Toolbar>
          </AppBar>
        )
      }
      <Outlet />
    </>
  )
}