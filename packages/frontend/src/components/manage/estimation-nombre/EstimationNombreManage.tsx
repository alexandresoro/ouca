import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationNombreCreate from "./EstimationNombreCreate";
import EstimationNombrePage from "./EstimationNombrePage";
import EstimationNombreUpdate from "./EstimationNombreUpdate";

const EstimationNombreManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<EstimationNombrePage />}
      createElement={<EstimationNombreCreate />}
      editElement={<EstimationNombreUpdate />}
    />
  );
};

export default EstimationNombreManage;
