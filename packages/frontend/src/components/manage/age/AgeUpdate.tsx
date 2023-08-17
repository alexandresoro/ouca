import { getAgeResponse, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import AgeEdit from "./AgeEdit";

type AgeUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertAgeInput) => void;
};

const AgeUpdate: FunctionComponent<AgeUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/ages/${id}`, schema: getAgeResponse },
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

  const handleSubmit: SubmitHandler<UpsertAgeInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && <AgeEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />}
    </>
  );
};

export default AgeUpdate;
