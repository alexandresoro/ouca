import { Suspense, lazy, type FunctionComponent } from "react";
import { Route, Routes } from "react-router-dom";

const ObservateurManage = lazy(() => import("../components/manage/observateur/ObservateurManage"));
const DepartementManage = lazy(() => import("../components/manage/departement/DepartementManage"));
const CommuneManage = lazy(() => import("../components/manage/commune/CommuneManage"));
const LieuDitManage = lazy(() => import("../components/manage/lieu-dit/LieuDitManage"));
const MeteoManage = lazy(() => import("../components/manage/meteo/MeteoManage"));
const ClasseManage = lazy(() => import("../components/manage/classe/ClasseManage"));
const EspeceManage = lazy(() => import("../components/manage/espece/EspeceManage"));
const SexeManage = lazy(() => import("../components/manage/sexe/SexeManage"));
const AgeManage = lazy(() => import("../components/manage/age/AgeManage"));
const EstimationNombreManage = lazy(() => import("../components/manage/estimation-nombre/EstimationNombreManage"));
const EstimationDistanceManage = lazy(
  () => import("../components/manage/estimation-distance/EstimationDistanceManage")
);
const ComportementManage = lazy(() => import("../components/manage/comportement/ComportementManage"));
const MilieuManage = lazy(() => import("../components/manage/milieu/MilieuManage"));

/**
 * @deprecated migrate to routes-manage
 */
const RoutesManage: FunctionComponent = () => {
  return (
    <Routes>
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
    </Routes>
  );
};

export default RoutesManage;
