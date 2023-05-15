import { getWeatherResponse, upsertWeatherResponse, type UpsertWeatherInput } from "@ou-ca/common/api/weather";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import MeteoEdit from "./MeteoEdit";

const MeteoUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/weather/${id!}`, schema: getWeatherResponse },
    {
      enabled: enabledQuery,
    }
  );

  useEffect(() => {
    setEnabledQuery(false);
  }, [data]);

  useEffect(() => {
    if (isError) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [isError, displayNotification, t]);

  const { mutate } = useApiMutation(
    {
      path: `/weather/${id!}`,
      method: "PUT",
      schema: upsertWeatherResponse,
    },
    {
      onSuccess: (updatedWeather) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/weather/${updatedWeather.id}`], updatedWeather);
        navigate("..");
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
    }
  );

  const onSubmit: SubmitHandler<UpsertWeatherInput> = (input) => {
    mutate({ body: input });
  };

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <MeteoEdit title={t("weatherEditionTitle")} defaultValues={data} onSubmit={onSubmit} />
      )}
    </>
  );
};

export default MeteoUpdate;
