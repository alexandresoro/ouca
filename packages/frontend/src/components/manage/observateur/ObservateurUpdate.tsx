import { getObserverResponse, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import ObservateurEdit from "./ObservateurEdit";

type ObservateurUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertObserverInput) => void;
};

const ObservateurUpdate: FunctionComponent<ObservateurUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/observers/${id}`, schema: getObserverResponse },
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

  const handleSubmit: SubmitHandler<UpsertObserverInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && (
        <ObservateurEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />
      )}
    </>
  );
};

export default ObservateurUpdate;
