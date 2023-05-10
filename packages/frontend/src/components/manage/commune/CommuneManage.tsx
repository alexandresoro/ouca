import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import CommuneEdit from "./CommuneEdit";
import CommunePage from "./CommunePage";

const CommuneManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<CommunePage />}
      createElement={<CommuneEdit isEditionMode={false} />}
      editElement={<CommuneEdit isEditionMode={true} />}
    />
  );
};

export default CommuneManage;
