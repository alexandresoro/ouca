import { type WeatherExtended } from "@ou-ca/common/entities/weather";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import MeteoDeleteDialog from "./MeteoDeleteDialog";
import MeteoTable from "./MeteoTable";

const MeteoPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [weatherToDelete, setWeatherToDelete] = useState<WeatherExtended | null>(null);

  const { mutate: generateExport } = useApiExportEntities({ filename: t("weathers") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/weathers" });
  };

  const handleDeleteWeather = (weatherToDelete: WeatherExtended) => {};

  return (
    <>
      <ManageTopBar title={t("weathers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MeteoTable onClickUpdateWeather={handleUpdateClick} />
      </ContentContainerLayout>
      <MeteoDeleteDialog
        weatherToDelete={weatherToDelete}
        onCancelDeletion={() => setWeatherToDelete(null)}
        onConfirmDeletion={handleDeleteWeather}
      />
    </>
  );
};

export default MeteoPage;
