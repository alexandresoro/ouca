import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import MeteoPage from "./MeteoPage";

const MeteoManage: FunctionComponent = () => {
  return <RouteManage pageElement={<MeteoPage />} createEditElement={<></>} />;
};

export default MeteoManage;
