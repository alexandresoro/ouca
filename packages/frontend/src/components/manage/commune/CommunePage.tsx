import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import CommuneTable from "./CommuneTable";

const CommunePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("towns") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/towns" });
  };

  return (
    <>
      <ManageTopBar title={t("towns")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <CommuneTable onClickUpdateTown={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default CommunePage;
