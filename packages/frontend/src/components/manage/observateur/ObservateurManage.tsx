import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ObservateurEdit from "./ObservateurEdit";
import ObservateurPage from "./ObservateurPage";

const ObservateurManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<ObservateurPage />}
      createElement={<ObservateurEdit isEditionMode={false} />}
      editElement={<ObservateurEdit isEditionMode={true} />}
    />
  );
};

export default ObservateurManage;
