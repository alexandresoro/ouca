import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import DepartementEdit from "./DepartementEdit";
import DepartementPage from "./DepartementPage";

const DepartementManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<DepartementPage />}
      createElement={<DepartementEdit isEditionMode={false} />}
      editElement={<DepartementEdit isEditionMode={true} />}
    />
  );
};

export default DepartementManage;
