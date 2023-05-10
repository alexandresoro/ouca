import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import AgeCreate from "./AgeCreate";
import AgePage from "./AgePage";
import AgeUpdate from "./AgeUpdate";

const AgeManage: FunctionComponent = () => {
  return <RouteManage pageElement={<AgePage />} createElement={<AgeCreate />} editElement={<AgeUpdate />} />;
};

export default AgeManage;
