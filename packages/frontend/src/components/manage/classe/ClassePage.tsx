import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ClasseTable from "./ClasseTable";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("speciesClasses") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/classes" });
  };

  return (
    <>
      <ManageTopBar title={t("speciesClasses")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ClasseTable />
      </ContentContainerLayout>
    </>
  );
};

export default ClassePage;
