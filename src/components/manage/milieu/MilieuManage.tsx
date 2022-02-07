import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import MilieuPage from "./MilieuPage";

const MilieuManage: FunctionComponent = () => {
  return <RouteManage pageElement={<MilieuPage />} createElement={<></>} />;
};

export default MilieuManage;
