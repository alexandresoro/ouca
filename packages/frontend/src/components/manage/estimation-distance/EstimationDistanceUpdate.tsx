import { getDistanceEstimateResponse, type UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationDistanceEdit from "./EstimationDistanceEdit";

type EstimationDistanceUpdateProps = {
  id: string
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertDistanceEstimateInput) => void;
};

const EstimationDistanceUpdate: FunctionComponent<EstimationDistanceUpdateProps> = ({id, onCancel, onSubmit}) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/distance-estimates/${id}`, schema: getDistanceEstimateResponse },
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

  const handleSubmit: SubmitHandler<UpsertDistanceEstimateInput> = (input) => {
    onSubmit(id, input)
  };

  return (
    <>
      {!isLoading && !isError && data && (
        <EstimationDistanceEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />
      )}
    </>
  );
};

export default EstimationDistanceUpdate;
