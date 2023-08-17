import { getSexResponse, type UpsertSexInput } from "@ou-ca/common/api/sex";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import SexeEdit from "./SexeEdit";

type SexeUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertSexInput) => void;
};

const SexeUpdate: FunctionComponent<SexeUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/sexes/${id}`, schema: getSexResponse },
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

  const handleSubmit: SubmitHandler<UpsertSexInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && <SexeEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />}
    </>
  );
};

export default SexeUpdate;
