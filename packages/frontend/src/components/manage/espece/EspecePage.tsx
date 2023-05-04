import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EspeceTable from "./EspeceTable";

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("species") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/species" });
  };

  return (
    <>
      <ManageTopBar title={t("species")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EspeceTable />
      </ContentContainerLayout>
    </>
  );
};

export default EspecePage;
