import { Suspense, lazy, type FunctionComponent } from "react";
import { Route, Routes } from "react-router-dom";

const SexeManage = lazy(() => import("../components/manage/sexe/SexeManage"));

/**
 * @deprecated migrate to routes-manage
 */
const RoutesManage: FunctionComponent = () => {
  return (
    <Routes>
      <Route
        path="sexe/*"
        element={
          <Suspense fallback={<></>}>
            <SexeManage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default RoutesManage;
