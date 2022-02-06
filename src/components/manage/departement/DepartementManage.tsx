import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import DepartementPage from "./DepartementPage";

const DepartementManage: FunctionComponent = () => {
  return <RouteManage pageElement={<DepartementPage />} createElement={<></>} />;
};

export default DepartementManage;
