import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationNombreEdit from "./EstimationNombreEdit";
import EstimationNombrePage from "./EstimationNombrePage";

const EstimationNombreManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<EstimationNombrePage />}
      createEditElement={<EstimationNombreEdit isEditionMode={false} />}
    />
  );
};

export default EstimationNombreManage;
