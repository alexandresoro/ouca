import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationDistanceEdit from "./EstimationDistanceEdit";
import EstimationDistancePage from "./EstimationDistancePage";

const EstimationDistanceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EstimationDistancePage />}       createElement={<EstimationDistanceEdit isEditionMode={false} />}
  editElement={<EstimationDistanceEdit isEditionMode={true} />} />;
};

export default EstimationDistanceManage;
