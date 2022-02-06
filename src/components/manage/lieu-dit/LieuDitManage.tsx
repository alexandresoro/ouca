import { FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import LieuDitPage from "./LieuDitPage";

const LieuDitManage: FunctionComponent = () => {
  return <RouteManage pageElement={<LieuDitPage />} createElement={<></>} />;
};

export default LieuDitManage;
