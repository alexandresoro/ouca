import { type FunctionComponent } from "react";
import ComportementEdit from "./ComportementEdit";

const ComportementCreate: FunctionComponent = () => {
  return <ComportementEdit isEditionMode={false} />;
};

export default ComportementCreate;
