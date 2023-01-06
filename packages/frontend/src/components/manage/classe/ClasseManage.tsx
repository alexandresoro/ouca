import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ClassePage from "./ClassePage";

const ClasseManage: FunctionComponent = () => {
  return <RouteManage pageElement={<ClassePage />} createEditElement={<></>} />;
};

export default ClasseManage;
