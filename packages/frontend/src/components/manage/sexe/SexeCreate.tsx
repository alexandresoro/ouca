import { upsertSexResponse, type UpsertSexInput } from "@ou-ca/common/api/sex";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import SexeEdit from "./SexeEdit";

type SexeCreateProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const SexeCreate: FunctionComponent<SexeCreateProps> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/sexes",
      method: "POST",
      schema: upsertSexResponse,
    },
    {
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("sexAlreadyExistingError"),
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

  const onSubmit: SubmitHandler<UpsertSexInput> = (input) => {
    mutate({ body: input });
  };

  return <SexeEdit title={t("sexCreationTitle")} onCancel={onCancel} onSubmit={onSubmit} />;
};

export default SexeCreate;
