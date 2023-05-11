import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import LieuDitCreate from "./LieuDitCreate";
import LieuDitPage from "./LieuDitPage";
import LieuDitUpdate from "./LieuDitUpdate";

const LieuDitManage: FunctionComponent = () => {
  return (
    <RouteManage pageElement={<LieuDitPage />} createElement={<LieuDitCreate />} editElement={<LieuDitUpdate />} />
  );
};

export default LieuDitManage;
