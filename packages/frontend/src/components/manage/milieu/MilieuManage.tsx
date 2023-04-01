import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import MilieuEdit from "./MilieuEdit";
import MilieuPage from "./MilieuPage";

const MilieuManage: FunctionComponent = () => {
  return <RouteManage pageElement={<MilieuPage />} createEditElement={<MilieuEdit isEditionMode={false} />} />;
};

export default MilieuManage;
