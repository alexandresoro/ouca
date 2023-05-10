import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EstimationNombreEdit from "./EstimationNombreEdit";
import EstimationNombrePage from "./EstimationNombrePage";

const EstimationNombreManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<EstimationNombrePage />}
      createElement={<EstimationNombreEdit isEditionMode={false} />}
      editElement={<EstimationNombreEdit isEditionMode={true} />}
    />
  );
};

export default EstimationNombreManage;
