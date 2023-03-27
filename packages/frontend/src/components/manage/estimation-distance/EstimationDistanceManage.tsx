import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationDistanceEdit from "./EstimationDistanceEdit";
import EstimationDistancePage from "./EstimationDistancePage";

const EstimationDistanceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EstimationDistancePage />} createEditElement={<EstimationDistanceEdit isEditionMode={false} />} />;
};

export default EstimationDistanceManage;
