import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import MilieuCreate from "./MilieuCreate";
import MilieuPage from "./MilieuPage";
import MilieuUpdate from "./MilieuUpdate";

const MilieuManage: FunctionComponent = () => {
  return <RouteManage pageElement={<MilieuPage />} createElement={<MilieuCreate />} editElement={<MilieuUpdate />} />;
};

export default MilieuManage;
