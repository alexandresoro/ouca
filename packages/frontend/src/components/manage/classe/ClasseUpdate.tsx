import { getClassResponse, upsertClassResponse, type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import ClasseEdit from "./ClasseEdit";

type ClasseUpdateProps = {
  onCancel?: () => void;
  onSubmit?: (id: string, input: UpsertClassInput) => void;
};

const ClasseUpdate: FunctionComponent<ClasseUpdateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/classes/${id!}`, schema: getClassResponse },
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
      path: `/classes/${id!}`,
      method: "PUT",
      schema: upsertClassResponse,
    },
    {
      onSuccess: (updatedClass) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/class/${updatedClass.id}`], updatedClass);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesClassAlreadyExistingError"),
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

  const onSubmitLegacy: SubmitHandler<UpsertClassInput> = (input) => {
    mutate({ body: input });
  };

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <ClasseEdit
          title={t("speciesClassEditionTitle")}
          defaultValues={data}
          onCancel={() => navigate("..")}
          onSubmit={onSubmitLegacy}
        />
      )}
    </>
  );
};

export default ClasseUpdate;
