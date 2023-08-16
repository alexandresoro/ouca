import { type WeatherExtended } from "@ou-ca/common/entities/weather";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
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

  const { mutate: deleteWeather } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "weatherTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setWeatherToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("weathers") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/weathers" });
  };

  const handleDeleteWeather = (weatherToDelete: WeatherExtended) => {
    deleteWeather({ path: `/weathers/${weatherToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("weathers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <MeteoTable onClickUpdateWeather={handleUpdateClick} onClickDeleteWeather={setWeatherToDelete} />
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
