import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ComportementCreate from "./ComportementCreate";
import ComportementPage from "./ComportementPage";
import ComportementUpdate from "./ComportementUpdate";

const ComportementManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<ComportementPage />}
      createElement={<ComportementCreate />}
      editElement={<ComportementUpdate />}
    />
  );
};

export default ComportementManage;
