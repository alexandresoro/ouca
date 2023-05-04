import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import DepartementTable from "./DepartementTable";

const DepartementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("departments") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/departments" });
  };

  return (
    <>
      <ManageTopBar title={t("departments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <DepartementTable />
      </ContentContainerLayout>
    </>
  );
};

export default DepartementPage;
