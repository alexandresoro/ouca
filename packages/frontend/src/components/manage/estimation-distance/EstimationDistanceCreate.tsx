import { upsertDistanceEstimateResponse, type UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationDistanceEdit from "./EstimationDistanceEdit";

type EstimationDistanceCreateProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const EstimationDistanceCreate: FunctionComponent<EstimationDistanceCreateProps> = ({onCancel, onSuccess}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/distance-estimates",
      method: "POST",
      schema: upsertDistanceEstimateResponse,
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
            message: t("distancePrecisionAlreadyExistingError"),
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

  const onSubmit: SubmitHandler<UpsertDistanceEstimateInput> = (input) => {
    mutate({ body: input });
  };

  return <EstimationDistanceEdit title={t("distancePrecisionCreationTitle")} onCancel={onCancel} onSubmit={onSubmit} />;
};

export default EstimationDistanceCreate;
