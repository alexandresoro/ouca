import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ClasseEdit from "./ClasseEdit";
import ClassePage from "./ClassePage";

const ClasseManage: FunctionComponent = () => {
  return <RouteManage pageElement={<ClassePage />} createEditElement={<ClasseEdit isEditionMode={false} />} />;
};

export default ClasseManage;
