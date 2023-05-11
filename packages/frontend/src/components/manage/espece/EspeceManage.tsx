import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import EspeceCreate from "./EspeceCreate";
import EspecePage from "./EspecePage";
import EspeceUpdate from "./EspeceUpdate";

const EspeceManage: FunctionComponent = () => {
  return <RouteManage pageElement={<EspecePage />} createElement={<EspeceCreate />} editElement={<EspeceUpdate />} />;
};

export default EspeceManage;
