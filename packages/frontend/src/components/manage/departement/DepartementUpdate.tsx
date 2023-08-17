import {
  getDepartmentResponse,
  upsertDepartmentResponse,
  type UpsertDepartmentInput,
} from "@ou-ca/common/api/department";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import DepartementEdit from "./DepartementEdit";

type DepartementUpdateProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const DepartementUpdate: FunctionComponent<DepartementUpdateProps> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/departments/${id!}`, schema: getDepartmentResponse },
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
      path: `/departments/${id!}`,
      method: "PUT",
      schema: upsertDepartmentResponse,
    },
    {
      onSuccess: (updatedDepartment) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/department/${updatedDepartment.id}`], updatedDepartment);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("departmentAlreadyExistingError"),
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

  const onSubmit: SubmitHandler<UpsertDepartmentInput> = (input) => {
    mutate({ body: input });
  };

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <DepartementEdit
          title={t("departmentEditionTitle")}
          defaultValues={data}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default DepartementUpdate;
