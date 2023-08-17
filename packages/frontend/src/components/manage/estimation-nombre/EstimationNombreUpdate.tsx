import { getNumberEstimateResponse, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationNombreEdit from "./EstimationNombreEdit";

type EstimationNombreProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertNumberEstimateInput) => void;
};

const EstimationNombreUpdate: FunctionComponent<EstimationNombreProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/number-estimates/${id}`, schema: getNumberEstimateResponse },
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

  const handleSubmit: SubmitHandler<UpsertNumberEstimateInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && (
        <EstimationNombreEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />
      )}
    </>
  );
};

export default EstimationNombreUpdate;
