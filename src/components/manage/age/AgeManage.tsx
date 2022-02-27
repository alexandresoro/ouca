import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import AgePage from "./AgePage";

const AgeManage: FunctionComponent = () => {
  return <RouteManage pageElement={<AgePage />} createEditElement={<></>} />;
};

export default AgeManage;
