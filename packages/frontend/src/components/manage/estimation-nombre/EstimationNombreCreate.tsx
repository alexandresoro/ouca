import { upsertNumberEstimateResponse, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationNombreEdit from "./EstimationNombreEdit";

const EstimationNombreCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/number-estimates",
      method: "POST",
      schema: upsertNumberEstimateResponse,
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
            message: t("ageAlreadyExistingError"),
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

  const onSubmit: SubmitHandler<UpsertNumberEstimateInput> = (input) => {
    mutate({ body: input });
  };

  return <EstimationNombreEdit title={t("numberPrecisionCreationTitle")} onSubmit={onSubmit} />;
};

export default EstimationNombreCreate;
