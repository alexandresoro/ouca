import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { refocusExchange } from "@urql/exchange-refocus";
import { lazy, Suspense, useEffect, useMemo, type FunctionComponent } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { cacheExchange, createClient, dedupExchange, fetchExchange, Provider as UrqlProvider } from "urql";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import { UserProvider } from "./contexts/UserContext";
import { type AppConfig } from "./types/AppConfig";
import suspend from "./utils/suspend";

const LoginPage = lazy(() => import("./components/LoginPage"));
const CreatePage = lazy(() => import("./components/create/CreatePage"));
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

const fetchAppConfig = () =>
  fetch("/appconfig")
    .then((res) => res.json() as Promise<AppConfig>)
    .catch(() => {
      return {} as AppConfig;
    });

const App: FunctionComponent = () => {
  const config = suspend(fetchAppConfig);

  // Sentry
  if (config.sentry) {
    Sentry.init({
      ...config.sentry,
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
      ],
    });
  }

  const RouterRoutes = config.sentry ? Sentry.withSentryReactRouterV6Routing(Routes) : Routes;

  const apiUrl = config.apiUrl ?? "";

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
    </ApiUrlContext.Provider>
  );
};

export default App;
