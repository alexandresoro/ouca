import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import DepartementEdit from "./DepartementEdit";
import DepartementPage from "./DepartementPage";

const DepartementManage: FunctionComponent = () => {
  return (
    <RouteManage pageElement={<DepartementPage />} createEditElement={<DepartementEdit isEditionMode={false} />} />
  );
};

export default DepartementManage;
