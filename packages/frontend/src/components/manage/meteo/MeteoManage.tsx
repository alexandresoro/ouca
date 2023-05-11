import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import MeteoCreate from "./MeteoCreate";
import MeteoPage from "./MeteoPage";
import MeteoUpdate from "./MeteoUpdate";

const MeteoManage: FunctionComponent = () => {
  return <RouteManage pageElement={<MeteoPage />} createElement={<MeteoCreate />} editElement={<MeteoUpdate />} />;
};

export default MeteoManage;
