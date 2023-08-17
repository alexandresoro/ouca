import { upsertAgeResponse, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import AgeEdit from "./AgeEdit";

type AgeCreateProps = {
  onCancel?: () => void;
  onSubmit?: () => void;
};

const AgeCreate: FunctionComponent<AgeCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/ages",
      method: "POST",
      schema: upsertAgeResponse,
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

  return <AgeEdit title={t("ageCreationTitle")} onCancel={onCancel} onSubmit={onSubmitLegacy} />;
};

export default AgeCreate;
