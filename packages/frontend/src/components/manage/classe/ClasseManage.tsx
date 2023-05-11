import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ClasseCreate from "./ClasseCreate";
import ClassePage from "./ClassePage";
import ClasseUpdate from "./ClasseUpdate";

const ClasseManage: FunctionComponent = () => {
  return <RouteManage pageElement={<ClassePage />} createElement={<ClasseCreate />} editElement={<ClasseUpdate />} />;
};

export default ClasseManage;
