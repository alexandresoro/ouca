import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EspeceEdit from "./EspeceEdit";
import EspecePage from "./EspecePage";

const EspeceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EspecePage />} createEditElement={<EspeceEdit isEditionMode={false} />} />;
};

export default EspeceManage;
