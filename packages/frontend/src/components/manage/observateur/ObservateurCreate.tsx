import { upsertObserverResponse, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ObservateurEdit from "./ObservateurEdit";

type ObservateurCreateProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ObservateurCreate: FunctionComponent<ObservateurCreateProps> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/observers",
      method: "POST",
      schema: upsertObserverResponse,
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
            message: t("observerAlreadyExistingError"),
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

  const onSubmit: SubmitHandler<UpsertObserverInput> = (input) => {
    mutate({ body: input });
  };

  return <ObservateurEdit title={t("observerCreationTitle")} onCancel={onCancel} onSubmit={onSubmit} />;
};

export default ObservateurCreate;
