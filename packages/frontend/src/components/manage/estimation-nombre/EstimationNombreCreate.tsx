import { type FunctionComponent } from "react";
import EstimationNombreEdit from "./EstimationNombreEdit";

const EstimationNombreCreate: FunctionComponent = () => {
  return <EstimationNombreEdit isEditionMode={false} />;
};

export default EstimationNombreCreate;
