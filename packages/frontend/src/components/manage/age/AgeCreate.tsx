import { upsertAgeResponse, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import AgeEdit from "./AgeEdit";

const AgeCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/age",
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

  const onSubmit: SubmitHandler<UpsertAgeInput> = (input) => {
    mutate({ body: input });
  };

  return <AgeEdit title={t("ageCreationTitle")} onSubmit={onSubmit} />;
};

export default AgeCreate;
