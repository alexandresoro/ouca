import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EspeceTable from "./EspeceTable";

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("species") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/species" });
  };

  return (
    <>
      <ManageTopBar title={t("species")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EspeceTable onClickUpdateSpecies={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default EspecePage;
