import { Suspense, lazy, type FunctionComponent } from "react";
import { Route, Routes } from "react-router-dom";

const ObservateurManage = lazy(() => import("../components/manage/observateur/ObservateurManage"));
const SexeManage = lazy(() => import("../components/manage/sexe/SexeManage"));
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
        path="sexe/*"
        element={
          <Suspense fallback={<></>}>
            <SexeManage />
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
