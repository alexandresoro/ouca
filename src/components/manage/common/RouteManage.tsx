import { FunctionComponent, ReactElement } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

type RouteManageProps = {
  pageElement: ReactElement;
  createElement: ReactElement;
};

const RouteManage: FunctionComponent<RouteManageProps> = (props) => {
  const { pageElement, createElement } = props;
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={pageElement} />
        <Route path="create" element={createElement} />
      </Route>
    </Routes>
  );
};

export default RouteManage;
