import { type FunctionComponent } from "react";
import ObservateurEdit from "./ObservateurEdit";

const ObservateurCreate: FunctionComponent = () => {
  return <ObservateurEdit isEditionMode={false} />;
};

export default ObservateurCreate;
