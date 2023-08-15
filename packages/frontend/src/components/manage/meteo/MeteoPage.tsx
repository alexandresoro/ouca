import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import MeteoTable from "./MeteoTable";

const MeteoPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useApiExportEntities({ filename: t("weathers") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    mutate({ path: "/generate-export/weathers" });
  };

  return (
    <>
      <ManageTopBar title={t("weathers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MeteoTable onClickUpdateWeather={handleUpdateClick} />
      </ContentContainerLayout>
    </>
  );
};

export default MeteoPage;
