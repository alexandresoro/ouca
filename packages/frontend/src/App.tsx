import { refocusExchange } from "@urql/exchange-refocus";
import { Suspense, lazy, useEffect, useMemo, useState, type FunctionComponent } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Provider as UrqlProvider, cacheExchange, createClient, dedupExchange, fetchExchange } from "urql";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { AppContext, DEFAULT_CONFIG } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";
import { initApp } from "./utils/init-app";
import suspend from "./utils/suspend";

const LoginPage = lazy(() => import("./components/LoginPage"));
const CreatePage = lazy(() => import("./components/create/CreatePage"));
const ViewDonneesPage = lazy(() => import("./components/view/ViewDonneesPage"));
const ObservateurManage = lazy(() => import("./components/manage/observateur/ObservateurManage"));
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
const UserProfilePage = lazy(() => import("./components/user-profile/UserProfilePage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));

const App: FunctionComponent = () => {
  const { config, SentryRoutes } = suspend(initApp(Routes));

  const [appContext, setAppContext] = useState<AppContext>(DEFAULT_CONFIG);

  useEffect(() => {
    setAppContext({
      ...appContext,
      apiUrl: config.apiUrl ?? "",
      isSentryEnabled: !!config.sentry,
    });
  }, [config]);

  const urqlClient = useMemo(
    () =>
      createClient({
        url: `${appContext.apiUrl}/graphql`,
        exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
        requestPolicy: "cache-and-network",
        fetchOptions: {
          credentials: "include",
        },
      }),
    [appContext.apiUrl]
  );

  const RouterRoutes = SentryRoutes ?? Routes;

  return (
    <AppContext.Provider value={appContext}>
      <UrqlProvider value={urqlClient}>
        <BrowserRouter>
          <HelmetProvider>
            <Helmet>
              {/* Umami analytics */}
              {config.umami && <script async defer data-website-id={config.umami.id} src={config.umami.url}></script>}
            </Helmet>
            <UserProvider>
              <div className="bg-base-100">
                <Suspense fallback="">
                  <RouterRoutes>
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
                      <Route index element={<Navigate to="/create/new" replace={true} />}></Route>
                      <Route
                        path="create/new"
                        index
                        element={
                          <Suspense fallback={<></>}>
                            <CreatePage />
                          </Suspense>
                        }
                      ></Route>
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
                              <ObservateurManage />
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
                        path="profile"
                        element={
                          <Suspense fallback={<></>}>
                            <UserProfilePage />
                          </Suspense>
                        }
                      ></Route>
                      <Route
                        path="settings"
                        element={
                          <Suspense fallback={<></>}>
                            <SettingsPage />
                          </Suspense>
                        }
                      ></Route>
                    </Route>
                  </RouterRoutes>
                </Suspense>
              </div>
            </UserProvider>
          </HelmetProvider>
        </BrowserRouter>
      </UrqlProvider>
    </AppContext.Provider>
  );
};

export default App;
