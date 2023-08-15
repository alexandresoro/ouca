import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ClasseTable from "./ClasseTable";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("speciesClasses") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/classes" });
  };

  return (
    <>
      <ManageTopBar title={t("speciesClasses")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ClasseTable onClickUpdateSpeciesClass={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default ClassePage;
