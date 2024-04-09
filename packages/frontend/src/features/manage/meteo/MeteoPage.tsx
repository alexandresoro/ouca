import { useUser } from "@hooks/useUser";
import type { Weather, WeatherExtended } from "@ou-ca/common/api/entities/weather";
import { type UpsertWeatherInput, upsertWeatherResponse } from "@ou-ca/common/api/weather";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import MeteoCreate from "./MeteoCreate";
import MeteoDeleteDialog from "./MeteoDeleteDialog";
import MeteoTable from "./MeteoTable";
import MeteoUpdate from "./MeteoUpdate";

const MeteoPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertWeatherDialog, setUpsertWeatherDialog] = useState<
    null | { mode: "create" } | { mode: "update"; weather: Weather }
  >(null);
  const [weatherToDelete, setWeatherToDelete] = useState<WeatherExtended | null>(null);

  const { mutate: createWeather } = useApiMutation(
    {
      path: "/weathers",
      method: "POST",
      schema: upsertWeatherResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "weatherTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertWeatherDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("weatherAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    },
  );

  const { mutate: updateWeather } = useApiMutation(
    {
      method: "PUT",
      schema: upsertWeatherResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "weatherTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertWeatherDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("weatherAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    },
  );

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
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("weathers") });

  const handleCreateClick = () => {
    setUpsertWeatherDialog({ mode: "create" });
  };

  const handleUpdateClick = (weather: Weather) => {
    setUpsertWeatherDialog({ mode: "update", weather });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/weathers" });
  };

  const handleCreateWeather = (input: UpsertWeatherInput) => {
    createWeather({ body: input });
  };

  const handleUpdateWeather = (id: string, input: UpsertWeatherInput) => {
    updateWeather({ path: `/weathers/${id}`, body: input });
  };

  const handleDeleteWeather = (weatherToDelete: Weather) => {
    deleteWeather({ path: `/weathers/${weatherToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("weathers")}
        enableCreate={user?.permissions.weather.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <MeteoTable onClickUpdateWeather={handleUpdateClick} onClickDeleteWeather={setWeatherToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertWeatherDialog != null}
        onClose={() => setUpsertWeatherDialog(null)}
        title={
          upsertWeatherDialog?.mode === "create"
            ? t("weatherCreationTitle")
            : upsertWeatherDialog?.mode === "update"
              ? t("weatherEditionTitle")
              : undefined
        }
      >
        {upsertWeatherDialog?.mode === "create" && (
          <MeteoCreate onCancel={() => setUpsertWeatherDialog(null)} onSubmit={handleCreateWeather} />
        )}
        {upsertWeatherDialog?.mode === "update" && (
          <MeteoUpdate
            weather={upsertWeatherDialog.weather}
            onCancel={() => setUpsertWeatherDialog(null)}
            onSubmit={handleUpdateWeather}
          />
        )}
      </EntityUpsertDialog>
      <MeteoDeleteDialog
        weatherToDelete={weatherToDelete}
        onCancelDeletion={() => setWeatherToDelete(null)}
        onConfirmDeletion={handleDeleteWeather}
      />
    </>
  );
};

export default MeteoPage;
