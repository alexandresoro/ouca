import { type FunctionComponent } from "react";
import CommuneEdit from "./CommuneEdit";

const CommuneCreate: FunctionComponent = () => {
  return <CommuneEdit isEditionMode={false} />;
};

export default CommuneCreate;
