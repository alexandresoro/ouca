import { Box, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { cyan, grey, pink } from "@mui/material/colors";
import React, { FunctionComponent, lazy, Suspense, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CommuneManage from "./components/manage/commune/CommuneManage";
import EstimationNombreManage from "./components/manage/estimation-nombre/EstimationNombreManage";
import TempPage from "./components/TempPage";
import RequireAuth from "./components/utils/RequireAuth";
import { UserProvider } from "./contexts/UserContext";

const LoginPage = lazy(() => import("./components/LoginPage"));
const ObervateurManage = lazy(() => import("./components/manage/observateur/ObervateurManage"));
const AgeManage = lazy(() => import("./components/manage/age/AgeManage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));

const App: FunctionComponent = () => {
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
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Layout />
                  </RequireAuth>
                }
              >
                <Route index element={<TempPage />}></Route>
                <Route path="manage" element={<Outlet />}>
                  <Route
                    path="observateur/*"
                    element={
                      <Suspense fallback={<></>}>
                        <ObervateurManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="commune/*"
                    element={
                      <Suspense fallback={<></>}>
                        <CommuneManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="age/*"
                    element={
                      <Suspense fallback={<></>}>
                        <AgeManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="estimation-nombre/*"
                    element={
                      <Suspense fallback={<></>}>
                        <EstimationNombreManage />
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
};

export default App;
