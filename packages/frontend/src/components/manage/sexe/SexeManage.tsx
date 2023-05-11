import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import SexeCreate from "./SexeCreate";
import SexePage from "./SexePage";
import SexeUpdate from "./SexeUpdate";

const SexeManage: FunctionComponent = () => {
  return <RouteManage pageElement={<SexePage />} createElement={<SexeCreate />} editElement={<SexeUpdate />} />;
};

export default SexeManage;
