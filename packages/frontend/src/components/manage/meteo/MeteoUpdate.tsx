import { getWeatherResponse, type UpsertWeatherInput } from "@ou-ca/common/api/weather";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import MeteoEdit from "./MeteoEdit";

type MeteoUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertWeatherInput) => void;
};

const MeteoUpdate: FunctionComponent<MeteoUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/weathers/${id}`, schema: getWeatherResponse },
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

  const handleSubmit: SubmitHandler<UpsertWeatherInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && <MeteoEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />}
    </>
  );
};

export default MeteoUpdate;
