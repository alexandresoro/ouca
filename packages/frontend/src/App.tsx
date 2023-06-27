import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type UserManagerSettings } from "oidc-client-ts";
import { Suspense, lazy, useEffect, useMemo, useState, type FunctionComponent } from "react";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthHandler } from "./components/AuthHandler";
import { AppContext, DEFAULT_CONFIG } from "./contexts/AppContext";
import { queryClient } from "./query/query-client";
import loadAnalytics from "./services/load-analytics";
import { initApp } from "./utils/init-app";
import suspend from "./utils/suspend";

const UserSettingsProvider = lazy(() => import("./contexts/UserSettingsContext"));
const Layout = lazy(() => import("./components/Layout"));
const NewAccount = lazy(() => import("./components/new-account/NewAccount"));
const NewEntryPage = lazy(() => import("./components/entry/new-entry-page/NewEntryPage"));
const ExistingEntryPage = lazy(() => import("./components/entry/existing-entry-page/ExistingEntryPage"));
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

  useEffect(() => {
    loadAnalytics(config.umami);
  }, [config]);

  const oidcConfig = useMemo(() => {
    return {
      ...config.oidc,
      redirect_uri: `${window.location.protocol}//${window.location.host}/`,
      scope: "openid email profile",
    } satisfies UserManagerSettings;
  }, [config]);

  const RouterRoutes = SentryRoutes ?? Routes;

  return (
    <AppContext.Provider value={appContext}>
      <AuthProvider
        {...oidcConfig}
        onSigninCallback={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <BrowserRouter>
            <AuthHandler>
              <div className="bg-base-100">
                <Suspense fallback="">
                  <RouterRoutes>
                    <Route
                      path="/"
                      element={
                        <Suspense fallback={<></>}>
                          <UserSettingsProvider>
                            <Layout />
                          </UserSettingsProvider>
                        </Suspense>
                      }
                    >
                      <Route index element={<Navigate to="/create/new" replace={true} />} />
                      <Route
                        path="create/new"
                        element={
                          <Suspense fallback={<></>}>
                            <NewEntryPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="entry/:id"
                        element={
                          <Suspense fallback={<></>}>
                            <ExistingEntryPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="view"
                        element={
                          <Suspense fallback={<></>}>
                            <ViewDonneesPage />
                          </Suspense>
                        }
                      />
                      <Route path="manage" element={<Outlet />}>
                        <Route
                          path="observateur/*"
                          element={
                            <Suspense fallback={<></>}>
                              <ObservateurManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="departement/*"
                          element={
                            <Suspense fallback={<></>}>
                              <DepartementManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="commune/*"
                          element={
                            <Suspense fallback={<></>}>
                              <CommuneManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="lieudit/*"
                          element={
                            <Suspense fallback={<></>}>
                              <LieuDitManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="meteo/*"
                          element={
                            <Suspense fallback={<></>}>
                              <MeteoManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="classe/*"
                          element={
                            <Suspense fallback={<></>}>
                              <ClasseManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="espece/*"
                          element={
                            <Suspense fallback={<></>}>
                              <EspeceManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="sexe/*"
                          element={
                            <Suspense fallback={<></>}>
                              <SexeManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="age/*"
                          element={
                            <Suspense fallback={<></>}>
                              <AgeManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="estimation-nombre/*"
                          element={
                            <Suspense fallback={<></>}>
                              <EstimationNombreManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="estimation-distance/*"
                          element={
                            <Suspense fallback={<></>}>
                              <EstimationDistanceManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="comportement/*"
                          element={
                            <Suspense fallback={<></>}>
                              <ComportementManage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="milieu/*"
                          element={
                            <Suspense fallback={<></>}>
                              <MilieuManage />
                            </Suspense>
                          }
                        />
                      </Route>
                      <Route
                        path="profile"
                        element={
                          <Suspense fallback={<></>}>
                            <UserProfilePage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <Suspense fallback={<></>}>
                            <SettingsPage />
                          </Suspense>
                        }
                      />
                    </Route>
                    <Route
                      path="new-account"
                      element={
                        <Suspense fallback={<></>}>
                          <NewAccount />
                        </Suspense>
                      }
                    />
                  </RouterRoutes>
                </Suspense>
              </div>
            </AuthHandler>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
};

export default App;
