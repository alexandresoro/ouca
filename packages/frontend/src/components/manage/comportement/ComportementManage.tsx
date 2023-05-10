import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ComportementEdit from "./ComportementEdit";
import ComportementPage from "./ComportementPage";

const ComportementManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<ComportementPage />}
      createElement={<ComportementEdit isEditionMode={false} />}
      editElement={<ComportementEdit isEditionMode={true} />}
    />
  );
};

export default ComportementManage;
