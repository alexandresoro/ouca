import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import MeteoTable from "./MeteoTable";

const MeteoPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("weathers") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/weathers" });
  };

  return (
    <>
      <ManageTopBar title={t("weathers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MeteoTable />
      </ContentContainerLayout>
    </>
  );
};

export default MeteoPage;
