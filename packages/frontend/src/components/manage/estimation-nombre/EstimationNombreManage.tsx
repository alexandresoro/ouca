import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationNombrePage from "./EstimationNombrePage";

const EstimationNombreManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EstimationNombrePage />} createEditElement={<></>} />;
};

export default EstimationNombreManage;
