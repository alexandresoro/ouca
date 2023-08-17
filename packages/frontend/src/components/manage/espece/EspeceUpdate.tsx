import { getSpeciesResponse, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import EspeceEdit from "./EspeceEdit";

type EspeceUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertSpeciesInput) => void;
};

const EspeceUpdate: FunctionComponent<EspeceUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/species/${id}`, schema: getSpeciesResponse },
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

  const handleSubmit: SubmitHandler<UpsertSpeciesInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && (
        <EspeceEdit
          defaultValues={{ ...data, classId: data.classId ?? undefined }}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default EspeceUpdate;
