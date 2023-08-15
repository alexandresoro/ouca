import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import AgeTable from "./AgeTable";

const AgePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("ages") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/ages" });
  };

  return (
    <>
      <ManageTopBar title={t("ages")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <AgeTable onClickUpdateAge={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default AgePage;
