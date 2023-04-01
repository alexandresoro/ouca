import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ComportementEdit from "./ComportementEdit";
import ComportementPage from "./ComportementPage";

const ComportementManage: FunctionComponent = () => {
  return (
    <RouteManage pageElement={<ComportementPage />} createEditElement={<ComportementEdit isEditionMode={false} />} />
  );
};

export default ComportementManage;
