import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import SexePage from "./SexePage";

const SexeManage: FunctionComponent = () => {
  return <RouteManage pageElement={<SexePage />} createElement={<></>} />;
};

export default SexeManage;
