import {
  getNumberEstimateResponse,
  upsertNumberEstimateResponse,
  type UpsertNumberEstimateInput,
} from "@ou-ca/common/api/number-estimate";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationNombreEdit from "./EstimationNombreEdit";

const EstimationNombreUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/number-estimate/${id!}`, schema: getNumberEstimateResponse },
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
      path: `/number-estimate/${id!}`,
      method: "PUT",
      schema: upsertNumberEstimateResponse,
    },
    {
      onSuccess: (updatedNumberEstimate) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/number-estimate/${updatedNumberEstimate.id}`], updatedNumberEstimate);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("numberPrecisionAlreadyExistingError"),
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

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <EstimationNombreEdit title={t("numberPrecisionEditionTitle")} defaultValues={data} onSubmit={onSubmit} />
      )}
    </>
  );
};

export default EstimationNombreUpdate;
