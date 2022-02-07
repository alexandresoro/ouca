import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationDistancePage from "./EstimationDistancePage";

const EstimationDistanceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EstimationDistancePage />} createElement={<></>} />;
};

export default EstimationDistanceManage;
