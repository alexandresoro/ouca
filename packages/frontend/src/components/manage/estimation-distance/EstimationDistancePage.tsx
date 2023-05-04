import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EstimationDistanceTable from "./EstimationDistanceTable";

const EstimationDistancePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { mutate } = useApiExportEntities({ filename: t("distancePrecisions") });

  const handleExportClick = () => {
    mutate({ path: "/generate-export/distance-estimates" });
  };

  return (
    <>
      <ManageTopBar title={t("distancePrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout
      >
        <EstimationDistanceTable />
      </ContentContainerLayout>
    </>
  );
};

export default EstimationDistancePage;
