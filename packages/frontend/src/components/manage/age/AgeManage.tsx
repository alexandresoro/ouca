import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import AgeEdit from "./AgeEdit";
import AgePage from "./AgePage";

const AgeManage: FunctionComponent = () => {
  return <RouteManage pageElement={<AgePage />} createEditElement={<AgeEdit isEditionMode={false} />} />;
};

export default AgeManage;
