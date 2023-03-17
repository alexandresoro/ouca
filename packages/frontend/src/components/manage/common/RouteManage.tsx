import { cloneElement, type FunctionComponent, type ReactElement } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

type RouteManageProps = {
  pageElement: ReactElement;
  createEditElement: ReactElement;
};

const RouteManage: FunctionComponent<RouteManageProps> = (props) => {
  const { pageElement, createEditElement } = props;
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={pageElement} />
        <Route path="edit/:id" element={cloneElement(createEditElement, { isEditionMode: true })} />
        <Route path="create" element={cloneElement(createEditElement, { isEditionMode: false })} />
      </Route>
    </Routes>
  );
};

export default RouteManage;
