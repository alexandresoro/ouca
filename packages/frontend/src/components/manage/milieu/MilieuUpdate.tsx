import { getEnvironmentResponse, type UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import MilieuEdit from "./MilieuEdit";

type MilieuUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertEnvironmentInput) => void;
};

const MilieuUpdate: FunctionComponent<MilieuUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/environments/${id}`, schema: getEnvironmentResponse },
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

  const handleSubmit: SubmitHandler<UpsertEnvironmentInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && (
        <MilieuEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />
      )}
    </>
  );
};

export default MilieuUpdate;
