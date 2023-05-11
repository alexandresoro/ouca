import { type FunctionComponent } from "react";
import MeteoEdit from "./MeteoEdit";

const MeteoCreate: FunctionComponent = () => {
  return <MeteoEdit isEditionMode={false} />;
};

export default MeteoCreate;
