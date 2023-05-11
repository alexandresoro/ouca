import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import DepartementCreate from "./DepartementCreate";
import DepartementPage from "./DepartementPage";
import DepartementUpdate from "./DepartementUpdate";

const DepartementManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<DepartementPage />}
      createElement={<DepartementCreate />}
      editElement={<DepartementUpdate />}
    />
  );
};

export default DepartementManage;
