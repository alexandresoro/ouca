import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import SexeEdit from "./SexeEdit";
import SexePage from "./SexePage";

const SexeManage: FunctionComponent = () => {
  return <RouteManage pageElement={<SexePage />} createEditElement={<SexeEdit isEditionMode={false} />} />;
};

export default SexeManage;
