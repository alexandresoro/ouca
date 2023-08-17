import { getDepartmentResponse, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import DepartementEdit from "./DepartementEdit";

type DepartementUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertDepartmentInput) => void;
};

const DepartementUpdate: FunctionComponent<DepartementUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/departments/${id}`, schema: getDepartmentResponse },
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

  const handleSubmit: SubmitHandler<UpsertDepartmentInput> = (input) => {
    onSubmit(id, input);
  };

  return (
    <>
      {!isLoading && !isError && data && (
        <DepartementEdit defaultValues={data} onCancel={onCancel} onSubmit={handleSubmit} />
      )}
    </>
  );
};

export default DepartementUpdate;
