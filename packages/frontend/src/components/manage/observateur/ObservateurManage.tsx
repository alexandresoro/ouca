import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ObservateurCreate from "./ObservateurCreate";
import ObservateurPage from "./ObservateurPage";
import ObservateurUpdate from "./ObservateurUpdate";

const ObservateurManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<ObservateurPage />}
      createElement={<ObservateurCreate />}
      editElement={<ObservateurUpdate />}
    />
  );
};

export default ObservateurManage;
