import { type FunctionComponent } from "react";
import DepartementEdit from "./DepartementEdit";

const DepartementCreate: FunctionComponent = () => {
  return <DepartementEdit isEditionMode={false} />;
};

export default DepartementCreate;
