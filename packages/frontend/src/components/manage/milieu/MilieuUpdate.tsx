import {
  getEnvironmentResponse,
  upsertEnvironmentResponse,
  type UpsertEnvironmentInput,
} from "@ou-ca/common/api/environment";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import MilieuEdit from "./MilieuEdit";

type MilieuUpdateProps = {
  onCancel?: () => void;
  onSubmit?: (id: string, input: UpsertEnvironmentInput) => void;
};

const MilieuUpdate: FunctionComponent<MilieuUpdateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/environments/${id!}`, schema: getEnvironmentResponse },
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
      path: `/environments/${id!}`,
      method: "PUT",
      schema: upsertEnvironmentResponse,
    },
    {
      onSuccess: (updatedEnvironment) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/environment/${updatedEnvironment.id}`], updatedEnvironment);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("environmentAlreadyExistingError"),
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

  const handleSubmit: SubmitHandler<UpsertEnvironmentInput> = (input) => {
    mutate({ body: input });
  };

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <MilieuEdit
          title={t("environmentEditionTitle")}
          defaultValues={data}
          onCancel={() => navigate("..")}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default MilieuUpdate;
