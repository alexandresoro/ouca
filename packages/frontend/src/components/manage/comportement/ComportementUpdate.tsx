import { getBehaviorResponse, upsertBehaviorResponse, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import ComportementEdit from "./ComportementEdit";

type ComportementUpdateProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ComportementUpdate: FunctionComponent<ComportementUpdateProps> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/behaviors/${id!}`, schema: getBehaviorResponse },
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
      path: `/behaviors/${id!}`,
      method: "PUT",
      schema: upsertBehaviorResponse,
    },
    {
      onSuccess: (updatedBehavior) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/behavior/${updatedBehavior.id}`], updatedBehavior);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("behaviorAlreadyExistingError"),
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

  const onSubmit: SubmitHandler<UpsertBehaviorInput> = (input) => {
    mutate({ body: input });
  };

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <ComportementEdit
          title={t("behaviorEditionTitle")}
          defaultValues={data}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default ComportementUpdate;
