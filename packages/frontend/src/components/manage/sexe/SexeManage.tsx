import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import SexeEdit from "./SexeEdit";
import SexePage from "./SexePage";

const SexeManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<SexePage />}
      createElement={<SexeEdit isEditionMode={false} />}
      editElement={<SexeEdit isEditionMode={true} />}
    />
  );
};

export default SexeManage;
