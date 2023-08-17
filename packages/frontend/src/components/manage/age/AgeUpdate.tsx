import { getAgeResponse, upsertAgeResponse, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import AgeEdit from "./AgeEdit";

type AgeUpdateProps = {
  onCancel?: () => void;
  onSubmit?: (id: string, input: UpsertAgeInput) => void;
};

const AgeUpdate: FunctionComponent<AgeUpdateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/ages/${id!}`, schema: getAgeResponse },
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
      path: `/ages/${id!}`,
      method: "PUT",
      schema: upsertAgeResponse,
    },
    {
      onSuccess: (updatedAge) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/age/${updatedAge.id}`], updatedAge);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("ageAlreadyExistingError"),
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

  const onSubmitLegacy: SubmitHandler<UpsertAgeInput> = (input) => {
    mutate({ body: input });
  };

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isError && data && (
        <AgeEdit title={t("ageEditionTitle")} defaultValues={data} onCancel={onCancel} onSubmit={onSubmitLegacy} />
      )}
    </>
  );
};

export default AgeUpdate;
