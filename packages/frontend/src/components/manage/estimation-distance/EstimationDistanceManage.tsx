import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationDistanceCreate from "./EstimationDistanceCreate";
import EstimationDistancePage from "./EstimationDistancePage";
import EstimationDistanceUpdate from "./EstimationDistanceUpdate";

const EstimationDistanceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EstimationDistancePage />}       createElement={<EstimationDistanceCreate />}
  editElement={<EstimationDistanceUpdate />} />;
};

export default EstimationDistanceManage;
