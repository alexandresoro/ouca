import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import MeteoEdit from "./MeteoEdit";
import MeteoPage from "./MeteoPage";

const MeteoManage: FunctionComponent = () => {
  return <RouteManage pageElement={<MeteoPage />} createEditElement={<MeteoEdit isEditionMode={false} />} />;
};

export default MeteoManage;
