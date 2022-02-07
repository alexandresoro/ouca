import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import ComportementPage from "./ComportementPage";

const ComportementManage: FunctionComponent = () => {
  return <RouteManage pageElement={<ComportementPage />} createElement={<></>} />;
};

export default ComportementManage;
