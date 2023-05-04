import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import MilieuTable from "./MilieuTable";

const MilieuPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("environments") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/environments" });
  };

  return (
    <>
      <ManageTopBar title={t("environments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MilieuTable />
      </ContentContainerLayout>
    </>
  );
};

export default MilieuPage;
