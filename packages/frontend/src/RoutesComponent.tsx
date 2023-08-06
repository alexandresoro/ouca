import { Suspense, lazy, type FunctionComponent } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import LastInventory from "./components/inventory/last-inventory/LastInventory";

const UserSettingsProvider = lazy(() => import("./contexts/UserSettingsContext"));
const Layout = lazy(() => import("./components/Layout"));
const NewEntryPage = lazy(() => import("./components/entry/new-entry-page/NewEntryPage"));
const InventoryPage = lazy(() => import("./components/inventory/inventory-page/InventoryPage"));
const SearchPage = lazy(() => import("./components/search/SearchPage"));
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

/**
 * @deprecated migrate to createBrowserRouter
 */
const RoutesComponent: FunctionComponent = () => {
  return (
    <Routes>
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
        <Route index element={<Navigate to="/create-new" replace={true} />} />
        <Route
          path="create-new"
          element={
            <Suspense fallback={<></>}>
              <NewEntryPage />
            </Suspense>
          }
        />
        <Route
          path="last-inventory"
          element={
            <Suspense fallback={<></>}>
              <LastInventory />
            </Suspense>
          }
        />
        <Route
          path="inventory/:id"
          element={
            <Suspense fallback={<></>}>
              <InventoryPage />
            </Suspense>
          }
        />
        <Route
          path="search"
          element={
            <Suspense fallback={<></>}>
              <SearchPage />
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
    </Routes>
  );
};

export default RoutesComponent;
