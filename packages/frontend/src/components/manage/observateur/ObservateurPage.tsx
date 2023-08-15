import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurTable from "./ObservateurTable";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("observer") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/observers" });
  };

  return (
    <>
      <ManageTopBar title={t("observers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ObservateurTable onClickUpdateObserver={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default ObservateurPage;
