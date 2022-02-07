import { Box, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { cyan, grey, pink } from "@mui/material/colors";
import React, { FunctionComponent, lazy, Suspense, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import TempPage from "./components/TempPage";
import RequireAuth from "./components/utils/RequireAuth";
import { UserProvider } from "./contexts/UserContext";

const LoginPage = lazy(() => import("./components/LoginPage"));
const ObervateurManage = lazy(() => import("./components/manage/observateur/ObervateurManage"));
const DepartementManage = lazy(() => import("./components/manage/departement/DepartementManage"));
const CommuneManage = lazy(() => import("./components/manage/commune/CommuneManage"));
const LieuDitManage = lazy(() => import("./components/manage/lieu-dit/LieuDitManage"));
const MeteoManage = lazy(() => import("./components/manage/meteo/MeteoManage"));
const ClasseManage = lazy(() => import("./components/manage/classe/ClasseManage"));
const EspeceManage = lazy(() => import("./components/manage/espece/EspeceManage"));
const SexeManage = lazy(() => import("./components/manage/sexe/SexeManage"));
const AgeManage = lazy(() => import("./components/manage/age/AgeManage"));
const EstimationNombreManage = lazy(() => import("./components/manage/estimation-nombre/EstimationNombreManage"));
const EstimationDistanceManage = lazy(() => import("./components/manage/estimation-distance/EstimationDistanceManage"));
const MilieuManage = lazy(() => import("./components/manage/milieu/MilieuManage"));
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
                    path="departement/*"
                    element={
                      <Suspense fallback={<></>}>
                        <DepartementManage />
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
                    path="lieudit/*"
                    element={
                      <Suspense fallback={<></>}>
                        <LieuDitManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="meteo/*"
                    element={
                      <Suspense fallback={<></>}>
                        <MeteoManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="classe/*"
                    element={
                      <Suspense fallback={<></>}>
                        <ClasseManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="espece/*"
                    element={
                      <Suspense fallback={<></>}>
                        <EspeceManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="sexe/*"
                    element={
                      <Suspense fallback={<></>}>
                        <SexeManage />
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
                  <Route
                    path="estimation-distance/*"
                    element={
                      <Suspense fallback={<></>}>
                        <EstimationDistanceManage />
                      </Suspense>
                    }
                  ></Route>
                  <Route
                    path="milieu/*"
                    element={
                      <Suspense fallback={<></>}>
                        <MilieuManage />
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
