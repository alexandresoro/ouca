import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import CommunePage from "./CommunePage";

const CommuneManage: FunctionComponent = () => {
  return <RouteManage pageElement={<CommunePage />} createEditElement={<></>} />;
};

export default CommuneManage;
