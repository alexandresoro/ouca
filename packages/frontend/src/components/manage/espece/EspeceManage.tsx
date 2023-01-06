import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EspecePage from "./EspecePage";

const EspeceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EspecePage />} createEditElement={<></>} />;
};

export default EspeceManage;
