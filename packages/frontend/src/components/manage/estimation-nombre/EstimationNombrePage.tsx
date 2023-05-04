import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreTable from "./EstimationNombreTable";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("numberPrecisions") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/number-estimates" });
  };

  return (
    <>
      <ManageTopBar title={t("numberPrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationNombreTable />
      </ContentContainerLayout>
    </>
  );
};

export default EstimationNombrePage;
