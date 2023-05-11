import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import CommuneCreate from "./CommuneCreate";
import CommunePage from "./CommunePage";
import CommuneUpdate from "./CommuneUpdate";

const CommuneManage: FunctionComponent = () => {
  return (
    <RouteManage pageElement={<CommunePage />} createElement={<CommuneCreate />} editElement={<CommuneUpdate />} />
  );
};

export default CommuneManage;
