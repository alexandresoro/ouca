import { Box, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { cyan, grey, pink } from "@mui/material/colors";
import React, { lazy, ReactElement, Suspense, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import TempPage from "./components/TempPage";
import { UserProvider } from "./contexts/UserContext";

const LoginPage = lazy(() => import("./components/LoginPage"));
const ObservateurPage = lazy(() => import("./components/manage/observateur/ObservateurPage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));

export default function App(): ReactElement {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            main: cyan[800]
          },
          secondary: {
            main: pink["A200"]
          },
          ...(prefersDarkMode
            ? {}
            : {
                background: {
                  default: grey[50]
                }
              })
        },
        typography: {
          fontFamily: "Lato",
          button: {
            textTransform: "none"
          }
        },
        components: {
          MuiCard: {
            defaultProps: {
              elevation: 0
            },
            styleOverrides: {
              root: {
                borderStyle: "solid",
                borderWidth: "2px",
                borderColor: cyan[800]
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: "700"
              }
            }
          }
        }
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <Box
          sx={{
            backgroundColor: theme?.palette?.background?.default
          }}
        >
          <Suspense fallback="">
            <Routes>
              <Route
                path="/login"
                element={
                  <Suspense fallback={<></>}>
                    <LoginPage />
                  </Suspense>
                }
              ></Route>
              <Route path="/" element={<Layout />}>
                <Route index element={<TempPage />}></Route>
                <Route path="manage" element={<Outlet />}>
                  <Route
                    path="observateur"
                    element={
                      <Suspense fallback={<></>}>
                        <ObservateurPage />
                      </Suspense>
                    }
                  ></Route>
                </Route>
                <Route
                  path="configuration"
                  element={
                    <Suspense fallback={<></>}>
                      <SettingsPage />
                    </Suspense>
                  }
                ></Route>
              </Route>
            </Routes>
          </Suspense>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}
