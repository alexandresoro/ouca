import { type FunctionComponent, type ReactElement } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

type RouteManageProps = {
  pageElement: ReactElement;
  createElement: ReactElement;
  editElement: ReactElement;
};

const RouteManage: FunctionComponent<RouteManageProps> = (props) => {
  const { pageElement, createElement, editElement } = props;
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={pageElement} />
        <Route path="edit/:id" element={editElement} />
        <Route path="create" element={createElement} />
      </Route>
    </Routes>
  );
};

export default RouteManage;
