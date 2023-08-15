import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreTable from "./EstimationNombreTable";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("numberPrecisions") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/number-estimates" });
  };

  return (
    <>
      <ManageTopBar title={t("numberPrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationNombreTable onClickUpdateNumberEstimate={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default EstimationNombrePage;
