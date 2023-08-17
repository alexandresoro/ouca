import { upsertWeatherResponse, type UpsertWeatherInput } from "@ou-ca/common/api/weather";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import MeteoEdit from "./MeteoEdit";

type MeteoCreateProps = {
  onCancel?: () => void;
  onSubmit?: (input: UpsertWeatherInput) => void;
};

const MeteoCreate: FunctionComponent<MeteoCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/weathers",
      method: "POST",
      schema: upsertWeatherResponse,
    },
    {
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
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

  const handleSubmit: SubmitHandler<UpsertWeatherInput> = (input) => {
    mutate({ body: input });
  };

  return <MeteoEdit title={t("weatherCreationTitle")} onCancel={() => navigate("..")} onSubmit={handleSubmit} />;
};

export default MeteoCreate;
