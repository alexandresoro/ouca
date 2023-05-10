import { type FunctionComponent } from "react";
import RouteManage from "../common/RouteManage";
import LieuDitEdit from "./LieuDitEdit";
import LieuDitPage from "./LieuDitPage";

const LieuDitManage: FunctionComponent = () => {
  return (
    <RouteManage
      pageElement={<LieuDitPage />}
      createElement={<LieuDitEdit isEditionMode={false} />}
      editElement={<LieuDitEdit isEditionMode={true} />}
    />
  );
};

export default LieuDitManage;
