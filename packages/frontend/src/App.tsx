import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  StyledEngineProvider,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { cyan, grey, pink } from "@mui/material/colors";
import * as Sentry from "@sentry/react";
import { refocusExchange } from "@urql/exchange-refocus";
import { lazy, Suspense, useMemo, type FunctionComponent } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { cacheExchange, createClient, dedupExchange, fetchExchange, Provider as UrqlProvider } from "urql";
import Layout from "./components/Layout";
import TempPage from "./components/TempPage";
import RequireAuth from "./components/utils/RequireAuth";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import { UserProvider } from "./contexts/UserContext";
import { type AppConfig } from "./types/AppConfig";

const LoginPage = lazy(() => import("./components/LoginPage"));
const ViewDonneesPage = lazy(() => import("./components/view/ViewDonneesPage"));
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
const ComportementManage = lazy(() => import("./components/manage/comportement/ComportementManage"));
const MilieuManage = lazy(() => import("./components/manage/milieu/MilieuManage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

type AppProps = {
  appConfigWrapped: { read: () => AppConfig };
};

const App: FunctionComponent<AppProps> = (props) => {
  const { appConfigWrapped } = props;

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          palette: {
            mode: prefersDarkMode ? "dark" : "light",
            primary: {
              main: cyan[800],
            },
            secondary: {
              main: pink["A200"],
            },
            ...(prefersDarkMode
              ? {}
              : {
                  background: {
                    default: grey[50],
                  },
                }),
          },
          typography: {
            fontFamily: "Lato",
            button: {
              textTransform: "none",
            },
          },
          components: {
            MuiCard: {
              defaultProps: {
                elevation: 0,
              },
              styleOverrides: {
                root: {
                  borderStyle: "solid",
                  borderWidth: "2px",
                  borderColor: cyan[800],
                },
              },
            },
            MuiTableCell: {
              styleOverrides: {
                head: {
                  fontWeight: "700",
                },
              },
            },
          },
          breakpoints: {
            values: {
              xs: 0,
              sm: 640,
              md: 768,
              lg: 1024,
              xl: 1280,
            },
          },
        })
      ),
    [prefersDarkMode]
  );

  const userDetails = appConfigWrapped.read();

  const apiUrl = userDetails?.apiUrl ?? "";

  const urqlClient = useMemo(
    () =>
      createClient({
        url: `${apiUrl}/graphql`,
        exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
        requestPolicy: "cache-and-network",
        fetchOptions: {
          credentials: "include",
        },
      }),
    [apiUrl]
  );

  return (
    <ApiUrlContext.Provider value={apiUrl}>
      <UrqlProvider value={urqlClient}>
        <BrowserRouter>
          <HelmetProvider>
            <Helmet>
              {/* Umami analytics */}
              {userDetails?.umami && (
                <script async defer data-website-id={userDetails.umami.id} src={userDetails.umami.url}></script>
              )}
            </Helmet>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <UserProvider>
                  <div className="bg-neutral-50 dark:bg-neutral-900">
                    <Suspense fallback="">
                      <SentryRoutes>
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
                          <Route
                            path="view"
                            element={
                              <Suspense fallback={<></>}>
                                <ViewDonneesPage />
                              </Suspense>
                            }
                          ></Route>
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
                              path="comportement/*"
                              element={
                                <Suspense fallback={<></>}>
                                  <ComportementManage />
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
                      </SentryRoutes>
                    </Suspense>
                  </div>
                </UserProvider>
              </ThemeProvider>
            </StyledEngineProvider>
          </HelmetProvider>
        </BrowserRouter>
      </UrqlProvider>
    </ApiUrlContext.Provider>
  );
};

export default App;
