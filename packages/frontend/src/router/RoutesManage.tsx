import { Suspense, lazy, type FunctionComponent } from "react";
import { Route, Routes } from "react-router-dom";

const ObservateurManage = lazy(() => import("../components/manage/observateur/ObservateurManage"));
const LieuDitManage = lazy(() => import("../components/manage/lieu-dit/LieuDitManage"));
const MeteoManage = lazy(() => import("../components/manage/meteo/MeteoManage"));
const SexeManage = lazy(() => import("../components/manage/sexe/SexeManage"));
const EstimationNombreManage = lazy(() => import("../components/manage/estimation-nombre/EstimationNombreManage"));
const EstimationDistanceManage = lazy(
  () => import("../components/manage/estimation-distance/EstimationDistanceManage")
);
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
        path="sexe/*"
        element={
          <Suspense fallback={<></>}>
            <SexeManage />
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
