import { getDistanceEstimateResponse, upsertDistanceEstimateResponse, type UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationDistanceEdit from "./EstimationDistanceEdit";

const EstimationDistanceUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/distance-estimates/${id!}`, schema: getDistanceEstimateResponse },
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
      path: `/distance-estimates/${id!}`,
      method: "PUT",
      schema: upsertDistanceEstimateResponse,
    },
    {
      onSuccess: (updatedDistanceEstimate) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/distance-estimate/${updatedDistanceEstimate.id}`], updatedDistanceEstimate);
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

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <EstimationDistanceEdit title={t("distancePrecisionEditionTitle")} defaultValues={data} onSubmit={onSubmit} />
      )}
    </>
  );
};

export default EstimationDistanceUpdate;
